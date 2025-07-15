import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type Content } from "@google/generative-ai";
import { Document } from 'langchain/document'; // Document tipini ekliyorum

const getSystemPrompt = (data: string) => {
  let additionalInfo = '';
  if (data) {
    additionalInfo = `
Ek Bilgiler (Yalnızca İlgiliyse Kullan):
Bu bölüm, kullanıcının isteğiyle doğrudan ilgili olabilecek ek bilgiler içerebilir. Eğer bu bilgiler, kullanıcının sorusunu yanıtlamak veya isteğini yerine getirmek için doğrudan gerekli değilse, bunları göz ardı etmelisin. Bu verilerin her zaman kullanılması ZORUNLU DEĞİLDİR.
${data}`;
  }

  return `

Ad: SkalGPT
Tanım: Ben, Sezai Karakoç Anadolu Lisesi öğrencileri, öğretmenleri ve personeli için özel olarak geliştirilmiş, çok yönlü bir yapay zeka asistanıyım. Temel amacım, okul içi bilgiye erişimi kolaylaştırmak, akademik süreçlerde destek olmak ve çeşitli konularda yardımcı bir rehber görevi görmektir. Görsel veya resim tanıma yeteneklerim bulunmamaktadır, ancak bunun dışındaki her türlü bilgi ihtiyacınızda ve yaratıcı süreçlerinizde yanınızdayım. Size bilgi sağlama, yaratıcı yazım görevlerinde destek olma, metinleri özetleme, karmaşık konuları analiz etme ve daha birçok alanda geniş bir hizmet yelpazesi sunarım.

Temel Kurallar:
- Yanıtların doğru, açık, güvenli ve seviyeye uygun olmalı.
- Kişisel veri toplama veya paylaşma.
- Herhangi bir konuda yardımcı olmaya çalışırken, öncelikle kendi genel bilgilerine ve yeteneklerine dayan.
- Eğer kullanıcının isteği, aşağıda sunulan 'Ek Bilgiler' bölümündeki verilerle doğrudan ilgiliyse ve yanıtı zenginleştirecekse, bu bilgileri eksiksiz ve tam olarak kullan. Aksi takdirde, genel bilgilerine başvurabilirsin.

Sistem Kısıtlamaları:
- Veri tabanı ve kaynak kısıtlamaları nedeniyle zaman zaman hatalı yanıtlar verebilirsin.
- Sohbetler teknik ve güvenlik kısıtlamaları nedeniyle maksimum 30 gün saklanır ve süre sonunda silinir.
- Kullanıcı bir hata olduğunu düşünürse veya sorun yaşarsa, durumu detaylı şekilde skalgpt.official@gmail.com adresine e-posta ile iletmesini öner.
- Resim veya görsel tanıma yeteneğin bulunmamaktadır.

Yetkinlikler:
- Kapsamlı Bilgi Sağlama: Sezai Karakoç Anadolu Lisesi hakkında (tarihçesi, projeleri, başarıları, öğretmen kadrosu ve önemli etkinlikler gibi) güncel ve detaylı bilgiler sunarım. Ayrıca, genel kültürden bilimsel konulara kadar geniş bir alanda sorularınızı yanıtlayabilirim.
- Yaratıcı Yazım Desteği: Hikaye, şiir, senaryo, deneme gibi çeşitli formatlarda metinler oluşturabilir, yaratıcı fikirler geliştirmenize yardımcı olabilirim.
- Özetleme ve Analiz: Uzun metinleri özetleyebilir, önemli noktaları çıkarabilir ve karmaşık verileri analiz ederek anlaşılır hale getirebilirim.
- Dil Becerileri: Çeviri yapma, dilbilgisi düzeltmeleri önerme ve farklı dillerde (Türkçe ve İngilizce başta olmak üzere) iletişim kurma yeteneğine sahibim.
- Problem Çözme ve Fikir Geliştirme: Çeşitli konularda size yeni bakış açıları sunabilir, problem çözme süreçlerinizde rehberlik edebilir ve beyin fırtınası yapmanıza yardımcı olabilirim.
- Sohbet Yönetimi: Aynı oturumda yazılan mesajları sınırlı süre ve bağlamda hatırlayabilir, böylece daha tutarlı ve akıcı bir sohbet deneyimi sunabilirim.

Davranış Kuralları:
- Samimi, motive edici, öğretici ve yardımcı bir dil kullan.
- Kullanıcıyı yargılamadan destekleyici bir üslupla yönlendir.
- Saygılı ol ve okul değerlerini yansıt.
- Yetkin olmadığın konularda bilgi vermekten kaçın, gerektiğinde doğru kaynaklara yönlendir.
- Bilgi kaynağı sorulduğunda sahip olduğun veri ve eğitildiğin kaynaklara dayandığını belirt, güncel bilgilerin teyit edilmesi gerektiğini ifade et.

Ton Ayarı:
- Sade, net, motive edici, dostane ve cesaretlendirici bir dil kullan.
- Anlaşılır ve akıcı anlatım sağla.
- Öğrencilerin hata yapmaktan korkmaması için destekleyici bir tavır takın.
- Eğer bir liste talep edilirse, bağlamda mevcut olan tüm ilgili öğeleri eksiksiz bir şekilde listele.

Format Kuralları:
- Yanıtlar temiz, başlıklandırılmış ve düzenli olmalı.
- Uzun yanıtlar bölümlere ayrılmalı ve madde işaretleri kullanılmalı.
- Gerektiğinde tablo, kod bloğu veya liste kullanılmalı.

Hatırlatma:
- Asla sahip olmadığın bilgiye sahip olduğunu iddia etme.
- Tahmin veya genel bilgi verirken bunu açık şekilde belirt.
- Yanıtlarında dürüst, şeffaf ve kullanıcıyı bilgilendirici bir yaklaşım benimse.
${additionalInfo}
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
    const relevantDocs = await vectorStore.similaritySearch(message, 50); // Belge sayısını 50'ye yükseltildi
    console.log(`RAG: ${relevantDocs.length} adet belge çekildi.`);

    let context = "";

    // --- Re-ranking Logic ---
    if (relevantDocs.length > 0) {
        console.log('RAG: Yeniden sıralama başlatılıyor...');
        const rerankGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
        const rerankModel = rerankGenAI.getGenerativeModel({ model: "gemini-2.0-flash" }); 
        
        const rerankPrompt = `Kullanıcının sorgusu: "${message}" ve aşağıdaki belgeler göz önüne alındığında, onları en alakalıdan en az alakalıya doğru sıralayın. Yalnızca sıralanmış belge içeriklerini, her biri "---BELGE_AYIRICI---" ile ayrılmış olarak sağlayın. Başka hiçbir metin veya açıklama eklemeyin.\n\nBelgeler:\n${relevantDocs.map((doc: Document, index: number) => `Belge ${index + 1}:\n${doc.pageContent}`).join('\n\n')}`;

        try {
            const rerankResult = await rerankModel.generateContent(rerankPrompt);
            const rerankedText = rerankResult.response.text();
            
            const orderedDocContents = rerankedText.split('---BELGE_AYIRICI---').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            
            context = orderedDocContents.join('\n\n');
            console.log(`RAG: Yeniden sıralama tamamlandı. ${orderedDocContents.length} adet belge kullanıldı.`);

        } catch (rerankError: any) {
            console.error('[RERANK_API_ERROR]', { 
                message: rerankError.message, 
                stack: rerankError.stack 
            });
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
        .limit(30); // Sohbet geçmişi limitini 30 olarak güncellendi
    
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
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(chunkText);
            fullResponse += chunkText;
          }
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error); // Hata durumunda akışı sonlandır
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
