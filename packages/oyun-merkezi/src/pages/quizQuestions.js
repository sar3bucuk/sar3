const quizQuestions = [
  {
    question: "Türkiye'nin en yüksek dağı hangisidir?",
    options: ["Erciyes Dağı", "Kaçkar Dağı", "Ağrı Dağı", "Süphan Dağı"],
    answer: 2
  },
  {
    question: "İstanbul Boğazı hangi iki denizi birbirine bağlar?",
    options: ["Akdeniz - Karadeniz", "Marmara Denizi - Karadeniz", "Marmara Denizi - Ege Denizi", "Karadeniz - Ege Denizi"],
    answer: 1
  },
  {
    question: "Türkiye Cumhuriyeti'nin ilk Cumhurbaşkanı kimdir?",
    options: ["İsmet İnönü", "Mustafa Kemal Atatürk", "Celal Bayar", "Fevzi Çakmak"],
    answer: 1
  },
  {
    question: "Dünyanın en uzun nehri hangisidir?",
    options: ["Amazon Nehri", "Nil Nehri", "Mississipi Nehri", "Yangtze Nehri"],
    answer: 1
  },
  {
    question: "Elektrik akımının birimi nedir?",
    options: ["Volt", "Ohm", "Amper", "Watt"],
    answer: 2
  },
  {
    question: "Paris hangi ülkenin başkentidir?",
    options: ["Belçika", "Almanya", "İspanya", "Fransa"],
    answer: 3
  },
  {
    question: "Mona Lisa tablosunu kim yapmıştır?",
    options: ["Michelangelo", "Picasso", "Da Vinci", "Van Gogh"],
    answer: 2
  },
  {
    question: "Türkiye'nin en büyük gölü hangisidir?",
    options: ["Tuz Gölü", "Eğirdir Gölü", "Van Gölü", "Beyşehir Gölü"],
    answer: 2
  },
  {
    question: "FIFA Dünya Kupası kaç yılda bir düzenlenir?",
    options: ["2", "3", "4", "5"],
    answer: 2
  },
  {
    question: "Ay'da yürüyen ilk insan kimdir?",
    options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "John Glenn"],
    answer: 2
  },
  {
    question: "Türkiye'nin en kalabalık şehri hangisidir?",
    options: ["Ankara", "İzmir", "Bursa", "İstanbul"],
    answer: 3
  },
  {
    question: "Üçgenin iç açılar toplamı kaç derecedir?",
    options: ["90", "180", "270", "360"],
    answer: 1
  },
  {
    question: "FENERBAHÇE'nin renkleri nedir?",
    options: ["Siyah - Beyaz", "Sarı - Lacivert", "Yeşil - Beyaz", "Mavi - Beyaz"],
    answer: 1
  },
  {
    question: "Atom numarası 1 olan element hangisidir?",
    options: ["Oksijen", "Karbon", "Azot", "Hidrojen"],
    answer: 3
  },
  {
    question: "En uzun kara sınırımız hangi ülkeyle?",
    options: ["Yunanistan", "Bulgaristan", "İran", "Suriye"],
    answer: 2
  },
  {
    question: "DNA'nın açılımı nedir?",
    options: ["Deoxyribonucleic Acid", "Digital Network Adapter", "Dynamic Nucleic Acid", "Digital Neutral Atom"],
    answer: 0
  },
  {
    question: "Türkiye'nin batıdaki en uç noktası neresidir?",
    options: ["Gökçeada", "Babakale", "Datça", "Çeşme"],
    answer: 1
  },
  {
    question: "Rönesans'ın başladığı ülke hangisidir?",
    options: ["İspanya", "Fransa", "İngiltere", "İtalya"],
    answer: 3
  },
  {
    question: "Güneş Sistemi'nin en büyük gezegeni hangisidir?",
    options: ["Mars", "Jüpiter", "Venüs", "Uranüs"],
    answer: 1
  },
  {
    question: "Türkiye'de kaç coğrafi bölge vardır?",
    options: ["5", "6", "7", "8"],
    answer: 2
  },
  {
    question: "Türk bayrağındaki yıldız kaç köşelidir?",
    options: ["4", "5", "6", "8"],
    answer: 1
  },
  {
    question: "Dünya'nın en büyük okyanusu hangisidir?",
    options: ["Hint Okyanusu", "Atlantik Okyanusu", "Pasifik Okyanusu", "Arktik Okyanusu"],
    answer: 2
  },
  {
    question: "Matematikte Pi sayısı yaklaşık kaçtır?",
    options: ["2.14", "3.14", "4.14", "5.14"],
    answer: 1
  },
  {
    question: "Türkiye'nin para birimi nedir?",
    options: ["Dinar", "Lira", "Euro", "Peso"],
    answer: 1
  },
  {
    question: "Orman yangınlarıyla mücadele eden meslek grubu kimdir?",
    options: ["İtfaiyeci", "Polis", "Öğretmen", "Doktor"],
    answer: 0
  },
  {
    question: "Aşağıdakilerden hangisi şiir türüdür?",
    options: ["Roman", "Hikâye", "Sonnet", "Tiyatro"],
    answer: 2
  },
  {
    question: "Türkiye'nin üçüncü büyük şehri hangisidir?",
    options: ["Bursa", "İzmir", "Adana", "Konya"],
    answer: 1
  },
  {
    question: "Dünyanın en kalabalık ülkesi hangisidir?",
    options: ["Hindistan", "Çin", "Endonezya", "ABD"],
    answer: 1
  },
  {
    question: "Türkçede kaç harf vardır?",
    options: ["28", "29", "30", "31"],
    answer: 1
  },
  {
    question: "Türkiye'nin en büyük adası hangisidir?",
    options: ["Bozcaada", "Gökçeada", "Marmara Adası", "Tavşan Adası"],
    answer: 1
  },
  {
    question: "Kıbrıs hangi denizde bulunur?",
    options: ["Karadeniz", "Akdeniz", "Ege Denizi", "Marmara Denizi"],
    answer: 1
  },
  {
    question: "Türkiye'nin başkenti hangi şehirdir?",
    options: ["İzmir", "Antalya", "Ankara", "İstanbul"],
    answer: 2
  },
  {
    question: "Gökkuşağında kaç renk vardır?",
    options: ["5", "6", "7", "8"],
    answer: 2
  },
  {
    question: "Elektronun yükü nedir?",
    options: ["Pozitif", "Negatif", "Nötr", "Çift yük"],
    answer: 1
  },
  {
    question: "Osmanlı İmparatorluğu'nu kim kurmuştur?",
    options: ["Fatih Sultan Mehmet", "Yavuz Sultan Selim", "Osman Gazi", "Kanuni Sultan Süleyman"],
    answer: 2
  },
  {
    question: "Türkiye'nin en büyük akarsuyu hangisidir?",
    options: ["Fırat Nehri", "Dicle Nehri", "Kızılırmak", "Sakarya Nehri"],
    answer: 0
  },
  {
    question: "\"Ben bir Türk'üm, dinim cinsim uludur.\" dizeleri kime aittir?",
    options: ["Mehmet Akif Ersoy", "Namık Kemal", "Ziya Gökalp", "Yahya Kemal"],
    answer: 2
  },
  {
    question: "En fazla konuşulan dil hangisidir?",
    options: ["İngilizce", "Fransızca", "Çince", "İspanyolca"],
    answer: 2
  },
  {
    question: "Türkiye'nin doğusunda yer alan komşusu kimdir?",
    options: ["Yunanistan", "Gürcistan", "İran", "Bulgaristan"],
    answer: 2
  },
  {
    question: "Gözümüz hangi organın parçasıdır?",
    options: ["Sindirim", "Solunum", "Dolaşım", "Duyu"],
    answer: 3
  },
  {
    question: "DNA hangi hücre çekirdeğinde bulunur?",
    options: ["Prokaryot", "Mitokondri", "Ribozom", "Ökaryot"],
    answer: 3
  },
  {
    question: "Karadeniz'in en büyük liman kenti hangisidir?",
    options: ["Trabzon", "Samsun", "Rize", "Zonguldak"],
    answer: 1
  },
  {
    question: "Rüzgâr ölçen alete ne denir?",
    options: ["Termometre", "Barometre", "Higrometre", "Anemometre"],
    answer: 3
  },
  {
    question: "2020 Yaz Olimpiyatları hangi şehirde yapılmıştır?",
    options: ["Tokyo", "Londra", "Pekin", "Paris"],
    answer: 0
  },
  {
    question: "Matematikte sayıların sağa kaydırılması ne anlama gelir?",
    options: ["Çarpma", "Bölme", "Toplama", "Çıkarma"],
    answer: 1
  },
  {
    question: "Dünya Sağlık Örgütü'nün kısaltması nedir?",
    options: ["WHO", "UNO", "NATO", "UNICEF"],
    answer: 0
  },
  {
    question: "Ormanların yok edilmesi hangi isimle anılır?",
    options: ["Erozyon", "Çölleşme", "Sel", "Deforestasyon"],
    answer: 3
  },
  {
    question: "Türkiye'nin en uzun tüneli hangisidir?",
    options: ["Bolu Tüneli", "Zigana Tüneli", "Ovit Tüneli", "Ilgaz Tüneli"],
    answer: 1
  },
  {
    question: "\"Sefiller\" romanının yazarı kimdir?",
    options: ["Charles Dickens", "Victor Hugo", "Balzac", "Flaubert"],
    answer: 1
  },
  {
    question: "Güneş Sistemi'nde halkalarıyla ünlü gezegen hangisidir?",
    options: ["Mars", "Neptün", "Satürn", "Merkür"],
    answer: 2
  },
  {
    question: "Türkiye'nin en güneydeki ili hangisidir?",
    options: ["Hatay", "Mersin", "Antalya", "Adana"],
    answer: 0
  },
  {
    question: "Leonardo Da Vinci'nin ünlü resmi \"Son Akşam Yemeği\" hangi dine dair bir sahnedir?",
    options: ["İslamiyet", "Hristiyanlık", "Yahudilik", "Budizm"],
    answer: 1
  },
  {
    question: "Bitkiler fotosentez yaparken hangi gazı kullanır?",
    options: ["Oksijen", "Azot", "Karbon dioksit", "Helyum"],
    answer: 2
  },
  {
    question: "Şehirlerarası araç plakası 06 olan şehir hangisidir?",
    options: ["Bursa", "İzmir", "Ankara", "Konya"],
    answer: 2
  },
  {
    question: "Felsefede \"Bilgi nedir?\" sorusunu inceleyen dal nedir?",
    options: ["Estetik", "Ontoloji", "Epistemoloji", "Etik"],
    answer: 2
  },
  {
    question: "Türkiye'nin en büyük adliyesi hangi şehirde bulunur?",
    options: ["Ankara", "İstanbul", "İzmir", "Bursa"],
    answer: 1
  },
  {
    question: "Nobel Edebiyat Ödülü'nü kazanan ilk Türk yazar kimdir?",
    options: ["Nazım Hikmet", "Orhan Pamuk", "Yaşar Kemal", "Ahmet Ümit"],
    answer: 1
  },
  {
    question: "En küçük asal sayı hangisidir?",
    options: ["0", "1", "2", "3"],
    answer: 2
  },
  {
    question: "\"Bir Çöküşün Öyküsü\" adlı eser hangi yazarındır?",
    options: ["Stefan Zweig", "Dostoyevski", "Tolstoy", "Kafka"],
    answer: 0
  },
  {
    question: "Dünya'nın katmanlarından hangisi sıvıdır?",
    options: ["Çekirdek dışı", "Manto", "Kıta kabuğu", "Okyanus tabanı"],
    answer: 0
  },
  {
    question: "Türkiye'de denize kıyısı olmayan bir il hangisidir?",
    options: ["Balıkesir", "Aydın", "Tokat", "Mersin"],
    answer: 2
  },
  {
    question: "Suyun donma noktası kaç derecedir?",
    options: ["0°C", "10°C", "-10°C", "5°C"],
    answer: 0
  },
  {
    question: "\"Kutadgu Bilig\" adlı eseri kim yazmıştır?",
    options: ["Kaşgarlı Mahmut", "Yusuf Has Hacip", "Ali Kuşçu", "Piri Reis"],
    answer: 1
  },
  {
    question: "1 kilogram kaç gramdır?",
    options: ["10", "100", "1000", "10.000"],
    answer: 2
  },
  {
    question: "Türkiye'nin yüzölçümü en küçük ili hangisidir?",
    options: ["Kilis", "Bartın", "Yalova", "Tunceli"],
    answer: 2
  },
  {
    question: "\"Çanakkale Geçilmez\" sözü hangi savaş için söylenmiştir?",
    options: ["Kurtuluş Savaşı", "Çanakkale Savaşı", "Sakarya Savaşı", "Balkan Savaşı"],
    answer: 1
  },
  {
    question: "\"Dünyanın Yedi Harikası\"ndan biri hangisidir?",
    options: ["Eyfel Kulesi", "Tac Mahal", "Keops Piramidi", "Big Ben"],
    answer: 2
  },
  {
    question: "En fazla volkanik dağ hangi ülkededir?",
    options: ["Japonya", "Endonezya", "Şili", "Yunanistan"],
    answer: 1
  },
  {
    question: "\"Sinekli Bakkal\" romanını kim yazmıştır?",
    options: ["Halide Edib Adıvar", "Yakup Kadri Karaosmanoğlu", "Reşat Nuri Güntekin", "Peyami Safa"],
    answer: 0
  },
  {
    question: "Türkiye'nin kuzeyinde hangi deniz vardır?",
    options: ["Ege Denizi", "Akdeniz", "Karadeniz", "Marmara Denizi"],
    answer: 2
  },
  {
    question: "Türkiye'nin en uzun köprüsü hangisidir?",
    options: ["Boğaziçi Köprüsü", "Osmangazi Köprüsü", "Yavuz Sultan Selim Köprüsü", "Çanakkale Köprüsü"],
    answer: 3
  },
  {
    question: "Osmanlı Devleti'nde ilk matbaayı kim kurmuştur?",
    options: ["Katip Çelebi", "İbrahim Müteferrika", "Piri Reis", "Evliya Çelebi"],
    answer: 1
  },
  {
    question: "Türkiye'de kaç tane kıta sahanlığı vardır?",
    options: ["1", "2", "3", "4"],
    answer: 1
  },
  {
    question: "Türkiye'nin en kuzey noktası nerededir?",
    options: ["Sinop İnceburun", "Artvin Hopa", "Edirne Enez", "Samsun Alaçam"],
    answer: 0
  },
  {
    question: "\"Vatan yahut Silistre\" eseri kime aittir?",
    options: ["Ziya Paşa", "Namık Kemal", "Ahmet Mithat", "Şinasi"],
    answer: 1
  },
  {
    question: "Türkiye'de tarımsal üretimde en fazla yer kaplayan ürün nedir?",
    options: ["Buğday", "Çay", "Pamuk", "Ayçiçeği"],
    answer: 0
  },
  {
    question: "Dünyanın en büyük çölü hangisidir?",
    options: ["Kalahari", "Sahra", "Gobi", "Atacama"],
    answer: 1
  },
  {
    question: "Türkiye'nin en eski üniversitesi hangisidir?",
    options: ["İstanbul Üniversitesi", "Ankara Üniversitesi", "Ege Üniversitesi", "Hacettepe Üniversitesi"],
    answer: 0
  },
  {
    question: "Türkçedeki en kısa kelime hangisidir?",
    options: ["O", "Ve", "De", "Ne"],
    answer: 0
  },
  {
    question: "Türkiye'nin en uzun nehri hangisidir?",
    options: ["Fırat", "Dicle", "Kızılırmak", "Sakarya"],
    answer: 2
  },
  {
    question: "Cumhuriyet ilan edildiğinde Türkiye'nin başkenti hangi şehirdi?",
    options: ["Ankara", "İstanbul", "İzmir", "Bursa"],
    answer: 0
  },
  {
    question: "\"Süper Lig\" hangi spor dalına aittir?",
    options: ["Basketbol", "Futbol", "Voleybol", "Hentbol"],
    answer: 1
  },
  {
    question: "\"Divanü Lügati't Türk\" eseri kimindir?",
    options: ["Kaşgarlı Mahmut", "Yusuf Has Hacip", "Ali Kuşçu", "Piri Reis"],
    answer: 0
  },
  {
    question: "Türkiye'nin en yüksek barajı hangisidir?",
    options: ["Atatürk Barajı", "Keban Barajı", "Ilısu Barajı", "Deriner Barajı"],
    answer: 3
  },
  {
    question: "Antarktika hangi yarımkürede yer alır?",
    options: ["Kuzey", "Doğu", "Batı", "Güney"],
    answer: 3
  },
  {
    question: "\"Rüzgar Gibi Geçti\" romanı hangi ülkenin yazarı tarafından yazılmıştır?",
    options: ["İngiltere", "ABD", "Fransa", "Almanya"],
    answer: 1
  },
  {
    question: "Türkiye'nin en büyük adliyesi hangi ilçededir?",
    options: ["Bakırköy", "Üsküdar", "Kartal", "Çağlayan"],
    answer: 3
  },
  {
    question: "D vitamini eksikliği hangi hastalığa yol açabilir?",
    options: ["Şeker", "Raşitizm", "Anemi", "Astım"],
    answer: 1
  },
  {
    question: "Türkiye'nin en büyük ikinci gölü hangisidir?",
    options: ["Tuz Gölü", "Eğirdir Gölü", "Beyşehir Gölü", "Sapanca Gölü"],
    answer: 0
  },
  {
    question: "\"Tıbbın babası\" olarak bilinen kişi kimdir?",
    options: ["Hipokrat", "Galen", "Aristoteles", "Sokrates"],
    answer: 0
  },
  {
    question: "Türkiye'de ilk televizyon yayını hangi şehirde yapılmıştır?",
    options: ["İzmir", "Ankara", "İstanbul", "Bursa"],
    answer: 2
  },
  {
    question: "En küçük kemik nerededir?",
    options: ["Kol", "Bacak", "Kulak", "Parmak"],
    answer: 2
  },
  {
    question: "\"Erozyon\" neyi ifade eder?",
    options: ["Volkan patlaması", "Deprem", "Toprak aşınması", "Hava kirliliği"],
    answer: 2
  },
  {
    question: "Türkiye'nin en uzun karayolu tüneli hangi ilde yer alır?",
    options: ["Trabzon", "Artvin", "Rize", "Gümüşhane"],
    answer: 0
  },
  {
    question: "Dünya Sağlık Örgütü'nün merkezi hangi şehirdedir?",
    options: ["Paris", "Londra", "Cenevre", "Berlin"],
    answer: 2
  },
  {
    question: "Türkiye'nin en batıdaki ili hangisidir?",
    options: ["Edirne", "Çanakkale", "Kırklareli", "Balıkesir"],
    answer: 0
  },
  {
    question: "Türkçede \"harf devrimi\" hangi yıl yapılmıştır?",
    options: ["1923", "1928", "1933", "1938"],
    answer: 1
  },
  {
    question: "\"Simurg\" hangi mitolojide yer alır?",
    options: ["Yunan", "Roma", "Türk - İran", "Mısır"],
    answer: 2
  },
  {
    question: "Türkiye'nin en büyük havaalanı hangisidir?",
    options: ["Esenboğa Havalimanı", "İzmir Adnan Menderes Havalimanı", "İstanbul Havalimanı", "Sabiha Gökçen Havalimanı"],
    answer: 2
  },
  {
    question: "\"İstiklal Marşı\"nın yazarı kimdir?",
    options: ["Ziya Gökalp", "Yahya Kemal", "Mehmet Akif Ersoy", "Namık Kemal"],
    answer: 2
  }
];

export function getRandomQuizQuestions(count = 10) {
  const arr = [...quizQuestions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export default quizQuestions; 