import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type Content } from "@google/generative-ai";
import { Document } from 'langchain/document'; // Document tipini ekliyorum

export const runtime = 'edge';

const getSystemPrompt = (data: string) => {
  return `# SkalGPT Sistem Promptu

Ad: SkalGPT
Tanım: Sezai Karakoç Anadolu Lisesi öğrencileri, öğretmenleri ve idaresi için geliştirilen, güvenilir, sade, seviyeye uygun ve etkili bir dijital eğitim ve iletişim asistanısın.

Temel Kurallar:
- Sadece sahip olduğun bilgiler üzerinden cevap ver, sahip olmadığın bilgileri bildiğini iddia etme.
- Cevaplarını öncelikle verilen Veriler (${data}) içeriğine dayandır, yoksa genel bilgiler kullanabilirsin ancak bunu belirtmelisin.
- Güncel, yerel veya özel bilgi gerektiren sorularda bilgiye sahip değilsen belirt ve öğretmen veya idareye başvurulmasını öner.
- Yanıtların doğru, açık, seviyeye uygun ve güvenli olmalı.
- Gereksiz bilgi, spam veya okul kurallarına aykırı içerik üretme.
- Kişisel veri toplama veya paylaşma.

Sistem Kısıtlamaları:
- Veri tabanı ve kaynak kısıtlamaları nedeniyle zaman zaman hatalı yanıtlar verebilirsin.
- Sohbetler teknik ve güvenlik kısıtlamaları nedeniyle maksimum 30 gün saklanır ve süre sonunda silinir.
- Kullanıcı bir hata olduğunu düşünürse veya sorun yaşarsa, durumu detaylı şekilde skalgpt.official@gmail.com adresine e-posta ile iletmesini öner.

Yetkinlikler:
- Genel hafızaya veya sürekli öğrenme yeteneğine sahip değilsin, ancak aynı oturumda yazılan mesajları sınırlı süre ve bağlamda hatırlayabilir ve tutarlı cevaplar verebilirsin.
- Ders anlatma, özet çıkarma, not hazırlama.
- Seviyeye uygun soru hazırlama ve çözme.
- Yazılı ödevlerde rehberlik ve örnek oluşturma.
- Etkinlik önerileri ve okul kültürüne uygun proje fikirleri geliştirme.

Davranış Kuralları:
- Samimi, motive edici, öğretici ve seviyeye uygun bir dil kullan.
- Kullanıcıyı yargılamadan destekleyici bir üslupla yönlendir.
- Okul değerlerini yansıt, saygılı ol.
- Yetkin olmadığın konularda bilgi vermekten kaçın, gerektiğinde rehberlik servisine veya öğretmene yönlendir.
- Bilgi kaynağı sorulduğunda sahip olduğun veri ve eğitildiğin kaynaklara dayandığını belirt, güncel bilgilerin teyit edilmesi gerektiğini ifade et.

Ton Ayarı:
- Sade, net, motive edici, dostane ve cesaretlendirici bir dil kullan.
- Gereksiz uzun cümlelerden kaçın, anlaşılır ve akıcı anlatım sağla.
- Öğrencilerin hata yapmaktan korkmaması için destekleyici bir tavır takın.
- Eğer bir liste talep edilirse (örneğin 'tüm öğretmenler', 'bütün projeler' gibi), bağlamda mevcut olan tüm ilgili öğeleri eksiksiz bir şekilde listele.

Format Kuralları:
- Yanıtlar temiz, başlıklandırılmış ve düzenli olmalı.
- Uzun yanıtlar bölümlere ayrılmalı ve madde işaretleri kullanılmalı.
- Gerektiğinde tablo, kod bloğu veya liste kullanılmalı.

Hatırlatma:
- Asla sahip olmadığın bilgiye sahip olduğunu iddia etme.
- Tahmin veya genel bilgi verirken bunu açık şekilde belirt.
- Yanıtlarında dürüst, şeffaf ve kullanıcıyı bilgilendirici bir yaklaşım benimse.
`;
};

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(8000, 'Message cannot be longer than 8000 characters.'),
  sessionId: z.string().uuid('Invalid session ID format.'),
});

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(req: NextRequest) {
  // Add a check for the essential environment variable
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('FATAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
    return NextResponse.json({ error: 'Server configuration error: Missing service key.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten() }, { status: 400 });
    }

    const { message, sessionId } = validation.data;

    const cookieStore = cookies();
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: { user } } = await createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    ).auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save user message to the database, letting Supabase generate the ID
    await supabaseAdmin.from('chat_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: message,
    });

    // --- Vector Search and AI Logic ---
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY!,
        modelName: "embedding-001",
    });

    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabaseAdmin,
        tableName: "documents",
        queryName: "match_documents",
    });

    console.log('RAG: Similarity search başlatılıyor...');
    const relevantDocs = await vectorStore.similaritySearch(message, 35);
    console.log(`RAG: ${relevantDocs.length} adet belge çekildi.`);

    let context = "";

    // --- Re-ranking Logic ---
    if (relevantDocs.length > 0) {
        console.log('RAG: Yeniden sıralama başlatılıyor...');
        const rerankGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        // Using a potentially smaller/faster model for re-ranking
        // gemini-1.5-flash is generally faster and cost-effective for these tasks
        const rerankModel = rerankGenAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
        
        const rerankPrompt = `Kullanıcının sorgusu: "${message}" ve aşağıdaki belgeler göz önüne alındığında, onları en alakalıdan en az alakalıya doğru sıralayın. Yalnızca sıralanmış belge içeriklerini, her biri "---BELGE_AYIRICI---" ile ayrılmış olarak sağlayın. Başka hiçbir metin veya açıklama eklemeyin.

Belgeler:
${relevantDocs.map((doc: Document, index: number) => `Belge ${index + 1}:
${doc.pageContent}`).join('\n\n')}`;

        try {
            const rerankResult = await rerankModel.generateContent(rerankPrompt);
            const rerankedText = rerankResult.response.text();
            
            // Re-ranked metni ayrıştırarak sıralanmış belge içeriklerini al
            const orderedDocContents = rerankedText.split('---BELGE_AYIRICI---').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            
            // En iyi N belgeyi (örneğin ilk 3) ana bağlam için kullan
            context = orderedDocContents.join('\n\n');
            console.log(`RAG: Yeniden sıralama tamamlandı. ${orderedDocContents.length} adet belge kullanıldı.`);

        } catch (rerankError: any) {
            console.error('[RERANK_API_ERROR]', { 
                message: rerankError.message, 
                stack: rerankError.stack 
            });
            // Hata durumunda yeniden sıralama yapmadan orijinal bağlamı kullan
            context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
            console.log('RAG: Yeniden sıralama sırasında hata oluştu, orijinal belgeler bağlam olarak kullanıldı.', rerankError.message);
        }
    }
    // --- End Re-ranking Logic ---

    const { data: chatHistoryData } = await supabaseAdmin
        .from('chat_messages')
        .select('role, content')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(10);
    
    const chatHistory: ChatMessage[] = chatHistoryData || [];

    const history: Content[] = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    })).reverse(); // Reverse to have the correct order for the model

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const generationConfig = {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const systemInstruction = getSystemPrompt(context);

    const chat = model.startChat({
        history: [
            { role: 'user', parts: [{ text: "Lütfen sana vereceğim sistem rolünü ve kurallarını harfiyen uygula." }] },
            { role: 'model', parts: [{ text: `Anlaşıldı. Sistem rolünü ve kurallarını uygulayacağım. İşte rolüm ve kurallarım:\n\n${systemInstruction}` }] },
            ...history
        ],
        generationConfig,
    });

    const result = await chat.sendMessageStream(message);

    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(chunkText);
          fullResponse += chunkText;
        }
        
        if (fullResponse) {
            await supabaseAdmin.from('chat_messages').insert({
                session_id: sessionId,
                user_id: user.id,
                role: 'assistant',
                content: fullResponse,
            });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('[CHAT_API_ERROR]', { 
        message: error.message, 
        stack: error.stack 
    });
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}