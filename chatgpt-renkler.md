# ChatGPT Renk, Yazı Tipi ve Gradyan Sistem Rehberi

Bu belge, ChatGPT'nin (OpenAI) web uygulamasında kullandığı **renk paleti, yazı tipi ve gradyan sistemini** kendi projenizde **tutarlı şekilde uygulayabilmeniz** için hazırlanmıştır.

## 1️⃣ Yazı Tipi (Font Family)

ChatGPT web uygulaması **Inter** ailesini kullanır, modern, okunabilir ve farklı boyutlarda dengeli görünür.

### Kullanılacak Yazı Tipleri:
- `font-family: Inter, sans-serif;`
- Alternatifler: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue"`

### Nerede Kullanılır:
| Kullanım Alanı | Ağırlık | Boyut (yaklaşık) |
|---|---|---|
| Başlıklar (H1, H2) | 600-700 | 20-28px |
| Paragraf metinleri | 400-500 | 14-16px |
| Butonlar | 500-600 | 14-16px |
| Sistem mesajları | 400 | 12-14px |

---

## 2️⃣ Renk Paleti

ChatGPT’de kullanılan **ağırlıklı renk düzeni**:

### Ana Renkler:
- **Yeşil (Accent)**: `#10A37F`
- **Siyah**: `#000000`
- **Beyaz**: `#FFFFFF`

### Gri Tonları:
- `#343541` (Chat arkaplan)
- `#202123` (Yan panel arkaplan)
- `#40414F` (Koyu gri metin)
- `#565869` (Sekonder metin)
- `#8E8EA0` (Daha açık gri metin)

### Ek Renkler:
- Açık Yeşil: `#11A37F` (Hover durumları, vurgu)
- Hafif Gradyanlarda: `#19C37D` (Yeşil ton açılımı)

### Nerede Kullanılır:
| Renk | Kullanım Alanı |
|---|---|
| `#10A37F` | Buton arkaplanı, link vurguları |
| `#343541` | Chat mesaj arkaplanı |
| `#202123` | Yan menü arkaplanı |
| `#40414F` | Metin rengi |
| `#8E8EA0` | Placeholder metin rengi |
| `#FFFFFF` | Ana metin ve arkaplanlarda kontrast için |

---

## 3️⃣ Gradyan Sistemleri

OpenAI ChatGPT web uygulamasında **çok belirgin gradyan kullanılmaz**, sade renk blokları tercih edilir.

Ancak yeşil vurgu için hafif bir gradyan yaklaşımı kullanılabilir:

```css
background: linear-gradient(90deg, #10A37F 0%, #19C37D 100%);
````

### Nerede Kullanılır:

* **Buton hover durumlarında** arkaplan geçişi için
* **Profil/ayar butonlarında** hover efekti
* Eğer marka uyumlu bir splash ekran istiyorsanız yeşil gradyanı arkaplanda kullanabilirsiniz.

---

## 4️⃣ Karanlık ve Açık Tema

ChatGPT **koyu tema** odaklıdır, fakat açık tema da kullanılmaktadır.

### Koyu Tema:

* Arkaplan: `#343541` veya `#202123`
* Metin: `#FFFFFF` veya `#ECECF1`
* Vurgu: `#10A37F`

### Açık Tema:

* Arkaplan: `#FFFFFF`
* Metin: `#000000`
* Vurgu: `#10A37F`

---

## 5️⃣ Buton Stilleri

```css
.button {
    background-color: #10A37F;
    color: white;
    font-family: Inter, sans-serif;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 600;
    transition: background 0.2s ease;
}

.button:hover {
    background: linear-gradient(90deg, #10A37F 0%, #19C37D 100%);
}
```

---

## 6️⃣ Uygulama Örnekleri

✅ **Sayfa Arkaplanı**:

* Koyu mod için `background-color: #343541;`
* Açık mod için `background-color: #FFFFFF;`

✅ **Başlıklar ve Metin**:

* `color: #FFFFFF;` (koyu mod)
* `color: #000000;` (açık mod)
* Sekonder metin için `color: #8E8EA0;`

✅ **Butonlar**:

* Arkaplan: `#10A37F`
* Hover: Gradyan geçişli yeşil
* Yazı rengi: `#FFFFFF`

✅ **Link ve Vurgu**:

* `color: #10A37F;`

✅ **Input Placeholder**:

* `color: #8E8EA0;`

✅ **Chat Balonu**:

* Kullanıcı mesajı için `background: #40414F;`
* Asistan mesajı için `background: #343541;`

---

## 7️⃣ Özet

✅ **Font**: Inter, sans-serif
✅ **Renk Paleti**: #10A37F, #343541, #202123, #40414F, #8E8EA0, #FFFFFF
✅ **Gradyan**: Hafif yeşil ton geçişi, hoverlarda uygulanabilir
✅ **Kullanım Alanları**: Başlıklar, metin, butonlar, chat arkaplanı ve vurgu alanlarında yukarıdaki kurallara göre kullanılmalıdır.