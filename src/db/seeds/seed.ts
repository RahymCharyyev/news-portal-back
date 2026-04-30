import 'dotenv/config';
import { db } from '../../config/database';
import { hashPassword } from '../../utils/password';

async function seed() {
  try {
    console.log('🌱 Начало заполнения базы данных тестовыми данными...');

    // Очищаем существующие данные (опционально, можно закомментировать)
    console.log('🗑️  Очистка существующих данных...');
    await db.deleteFrom('news').execute();
    await db.deleteFrom('categories').execute();
    await db.deleteFrom('users').execute();
    console.log('✅ Данные очищены');

    // Создаем пользователей
    console.log('👤 Создание пользователей...');
    const hashedPassword = await hashPassword('password123');

    const users = await db
      .insertInto('users')
      .values([
        {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Администратор',
          role: 'admin',
        },
        {
          email: 'editor@example.com',
          password: hashedPassword,
          name: 'Редактор',
          role: 'admin',
        },
        {
          email: 'author@example.com',
          password: hashedPassword,
          name: 'Автор',
          role: 'user',
        },
        {
          email: 'user@example.com',
          password: hashedPassword,
          name: 'Пользователь',
          role: 'user',
        },
      ])
      .returningAll()
      .execute();

    console.log(`✅ Создано ${users.length} пользователей`);

    // Создаем категории
    console.log('📁 Создание категорий...');
    const categories = await db
      .insertInto('categories')
      .values([
        {
          nameRu: 'Технологии',
          nameTm: 'Tehnologiýalar',
          nameEn: 'Technology',
          slug: 'tech',
          descriptionRu: 'Новости о технологиях, IT и инновациях',
          descriptionTm: 'Tehnologiýalar, IT we täzeçilikler barada habarlar',
          descriptionEn: 'News about technology, IT and innovations',
        },
        {
          nameRu: 'Наука',
          nameTm: 'Ylym',
          nameEn: 'Science',
          slug: 'science',
          descriptionRu: 'Научные открытия и исследования',
          descriptionTm: 'Ylymy açyşlar we gözlegler',
          descriptionEn: 'Scientific discoveries and research',
        },
        {
          nameRu: 'Спорт',
          nameTm: 'Sport',
          nameEn: 'Sport',
          slug: 'sport',
          descriptionRu: 'Спортивные новости и события',
          descriptionTm: 'Sport habarlary we wakalar',
          descriptionEn: 'Sports news and events',
        },
        {
          nameRu: 'Политика',
          nameTm: 'Politika',
          nameEn: 'Politics',
          slug: 'politics',
          descriptionRu: 'Политические новости и события',
          descriptionTm: 'Syýasy habarlar we wakalar',
          descriptionEn: 'Political news and events',
        },
        {
          nameRu: 'Экономика',
          nameTm: 'Ykdysadyýet',
          nameEn: 'Economy',
          slug: 'economy',
          descriptionRu: 'Экономические новости и аналитика',
          descriptionTm: 'Ykdysady habarlar we analitika',
          descriptionEn: 'Economic news and analytics',
        },
        {
          nameRu: 'Культура',
          nameTm: 'Medeniýet',
          nameEn: 'Culture',
          slug: 'culture',
          descriptionRu: 'Культурные события и искусство',
          descriptionTm: 'Medeni wakalar we sungat',
          descriptionEn: 'Cultural events and art',
        },
      ])
      .returningAll()
      .execute();

    console.log(`✅ Создано ${categories.length} категорий`);

    // Создаем новости
    console.log('📰 Создание новостей...');
    const now = new Date();
    const newsData = [
      {
        titleRu: 'Новые технологии в искусственном интеллекте',
        titleTm: 'Ýasama intellektde täze tehnologiýalar',
        titleEn: 'New advances in artificial intelligence',
        contentRu: `Искусственный интеллект продолжает развиваться стремительными темпами. 
        Новые модели машинного обучения показывают впечатляющие результаты в различных областях. 
        Исследователи разработали алгоритмы, которые могут обрабатывать информацию более эффективно, 
        чем когда-либо прежде. Это открывает новые возможности для применения ИИ в медицине, 
        образовании и других сферах жизни.`,
        contentTm: `Ýasama intellekt örän çalt ösýär. Maşyn öwrenişiniň täze modelleri dürli 
        ugurlarda gözellikli netijeler görkezýär. Gözlegçiler maglumatlary has amatly işlemäge 
        ukyply algoritmler döretdiler. Bu ÝI-ni lukmançylykda, bilimde we durmuşyň beýleki 
        ugurlarynda ulanyş üçin täze mümkinçilikleri açýar.`,
        contentEn: `Artificial intelligence keeps advancing at a rapid pace. New machine
        learning models are delivering impressive results across many fields. Researchers
        have developed algorithms that can process information more efficiently than ever
        before, opening new opportunities for AI in medicine, education and other areas of life.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[0].id, // Технологии
        authorId: users[0].id, // Администратор
        publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
      },
      {
        titleRu: 'Прорыв в квантовых вычислениях',
        titleTm: 'Kwant hasaplamalarynda öňe çykyş',
        titleEn: 'Breakthrough in quantum computing',
        contentRu: `Ученые объявили о значительном прорыве в области квантовых вычислений. 
        Новая квантовая система способна выполнять сложные вычисления в разы быстрее, 
        чем традиционные компьютеры. Это открытие может революционизировать криптографию, 
        моделирование молекул и решение оптимизационных задач.`,
        contentTm: `Alymlar kwant hasaplamalary ugrunda uly öňe çykyş barada habar berdi. 
        Täze kwant ulgamy çylşyrymly hasaplamalary geleneksel kompýuterlerden has çalt 
        ýerine ýetirip bilýär. Bu açyş kriptografiýany, molekulalaryň modellasdyrylmagyny 
        we optimizasiýa meseleleriniň çözülişini rewolýusiýalaşdyryp biler.`,
        contentEn: `Scientists have announced a significant breakthrough in quantum computing.
        The new quantum system is able to perform complex calculations many times faster
        than traditional computers. This discovery could revolutionize cryptography,
        molecular modeling and optimization problems.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[1].id,
        authorId: users[1].id,
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Чемпионат мира по футболу: итоги первого тура',
        titleTm: 'Dünýä futbol çempionaty: birinji aýlawyň jemleýji netijeleri',
        titleEn: 'World Cup: results of the first round',
        contentRu: `Первый тур чемпионата мира по футболу завершился сенсационными результатами. 
        Несколько фаворитов турнира потерпели неожиданные поражения, что сделало турнир еще более 
        интригующим. Болельщики по всему миру с нетерпением ждут следующих матчей.`,
        contentTm: `Dünýä futbol çempionatynyň birinji aýlawy sensasiýaly netijeler bilen tamamlandy. 
        Turnirleriň birnäçe ýyldyzlary gözlenilmedik ýeňilişlere sezewar boldy, bu bolsa turniri 
        has gyzykly etdi. Dünýä boýunça taraplar indiki oýunlary garaşýarlar.`,
        contentEn: `The first round of the World Cup ended with sensational results.
        Several tournament favorites suffered unexpected defeats, making the tournament
        even more intriguing. Fans around the world are eagerly waiting for the next matches.`,
        imageUrl: null,
        isFlash: true,
        categoryId: categories[2].id,
        authorId: users[2].id,
        publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Новые меры поддержки экономики',
        titleTm: 'Ykdysadyýeti goldamagyň täze çäreleri',
        titleEn: 'New measures to support the economy',
        contentRu: `Правительство объявило о новых мерах поддержки экономики. 
        Программа включает налоговые льготы для малого и среднего бизнеса, 
        а также инвестиции в инфраструктуру. Эксперты прогнозируют положительное 
        влияние этих мер на экономический рост в ближайшие годы.`,
        contentTm: `Hökümet ykdysadyýeti goldamagyň täze çäreleri barada habar berdi. 
        Programma kiçi we orta işewürlik üçin salgyt gowşaklyklary we infrastruktura 
        goýumlary öz içine alýar. Hünärmenler bu çäreleriň ýakyn ýyllarda ykdysady 
        ösüşe oňat täsir eder diýip çaklaýarlar.`,
        contentEn: `The government has announced new measures to support the economy.
        The program includes tax incentives for small and medium businesses, as well as
        investments in infrastructure. Experts predict a positive impact of these measures
        on economic growth in the coming years.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[4].id,
        authorId: users[0].id,
        publishedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Открытие нового музея современного искусства',
        titleTm: 'Häzirki zaman sungatynyň täze muzeýiniň açylyşy',
        titleEn: 'A new contemporary art museum opens',
        contentRu: `В столице открылся новый музей современного искусства, который стал 
        крупнейшим в регионе. Коллекция музея включает произведения известных художников 
        со всего мира. Первая выставка уже привлекла тысячи посетителей.`,
        contentTm: `Paýtagtda häzirki zaman sungatynyň täze muzeýi açyldy, ol regionda 
        iň uly boldy. Muzeýiň ýygyndysy dünýäniň meşhur suratkeşleriniň eserlerini öz 
        içine alýar. Ilkinji sergi eýýäm müňlerçe myhman çekdi.`,
        contentEn: `A new contemporary art museum has opened in the capital and became
        the largest in the region. The museum's collection includes works by famous
        artists from around the world. The first exhibition has already attracted
        thousands of visitors.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[5].id,
        authorId: users[1].id,
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Разработка нового процессора для мобильных устройств',
        titleTm: 'Mobil enjamlary üçin täze prosessor döretmek',
        titleEn: 'A new processor for mobile devices unveiled',
        contentRu: `Компания анонсировала новый процессор для мобильных устройств, 
        который обещает революционизировать производительность смартфонов. 
        Новый чип использует передовые технологии производства и оптимизированную архитектуру, 
        что позволяет достичь невероятной производительности при низком энергопотреблении.`,
        contentTm: `Kompaniýa mobil enjamlary üçin täze prosessor barada habar berdi, 
        ol smartfonlaryň işjeňligini rewolýusiýalaşdyrmaga wada berýär. Täze çip öňdebaryjy 
        öndüriş tehnologiýalaryny we optimizirlenen arhitekturany ulanyýar, bu bolsa 
        pes energiýa sarp edilende ajaýyp işjeňlik gazanmaga mümkinçilik berýär.`,
        contentEn: `The company has announced a new processor for mobile devices that
        promises to revolutionize smartphone performance. The new chip uses advanced
        manufacturing technology and optimized architecture, delivering remarkable
        performance at low power consumption.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[0].id,
        authorId: users[2].id,
        publishedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Открытие новой экзопланеты',
        titleTm: 'Täze ekzoplanetanyň açylyşy',
        titleEn: 'New exoplanet discovered',
        contentRu: `Астрономы обнаружили новую экзопланету в зоне обитаемости своей звезды. 
        Планета находится на расстоянии, где может существовать жидкая вода, что делает ее 
        потенциально пригодной для жизни. Это открытие расширяет список планет, 
        которые могут быть изучены в будущем.`,
        contentTm: `Astronomlar öz ýyldyzynyň ýaşaýyş zolagynda täze ekzoplanetany tapdylar. 
        Planeta suwuk suw bolup bilýän aralykda ýerleşýär, bu bolsa ony durmuş üçin 
        mümkin bolan edýär. Bu açyş geljekde öwrenilip biljek planetalaryň sanawyny giňeldýär.`,
        contentEn: `Astronomers have discovered a new exoplanet in the habitable zone of
        its star. The planet is at a distance where liquid water can exist, making it
        potentially habitable. This discovery expands the list of planets that can be
        studied in the future.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[1].id,
        authorId: users[0].id,
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Олимпийские игры: подготовка к открытию',
        titleTm: 'Olimpiýa oýunlary: açylyşa taýýarlyk',
        titleEn: 'Olympic Games: preparing for the opening',
        contentRu: `Организаторы Олимпийских игр завершили финальную подготовку к церемонии открытия. 
        Все объекты готовы к приему спортсменов и зрителей. Ожидается, что игры станут 
        одними из самых масштабных в истории.`,
        contentTm: `Olimpiýa oýunlarynyň guramalarçylary açylyş seremonisi üçin 
        soňky taýýarlygy tamamlady. Ähli obýektler sportçylary we tomaşaçylary 
        garşylamaga taýýar. Oýunlar taryhda iň uly boljak diýlip garaşylýar.`,
        contentEn: `The organizers of the Olympic Games have completed the final
        preparations for the opening ceremony. All venues are ready to welcome athletes
        and spectators. The games are expected to be one of the largest in history.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[2].id,
        authorId: users[1].id,
        publishedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Международный саммит по климату',
        titleTm: 'Klimat boýunça halkara sammiti',
        titleEn: 'International climate summit',
        contentRu: `Лидеры стран собрались на международный саммит по климату, 
        чтобы обсудить меры по борьбе с изменением климата. На саммите были приняты 
        важные решения о сокращении выбросов и переходе на возобновляемые источники энергии.`,
        contentTm: `Döwlet baştutanlary klimat üýtgemesi bilen göreşmek üçin çäreleri 
        çekişmek üçin klimat boýunça halkara sammitinde ýygnandy. Sammitde çykdylary 
        azaltmak we täzeden doldurýan energiýa çeşmelerine geçmek barada möhüm kararlar 
        kabul edildi.`,
        contentEn: `World leaders gathered at the international climate summit to discuss
        measures to combat climate change. Important decisions were made on reducing
        emissions and transitioning to renewable energy sources.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[3].id,
        authorId: users[0].id,
        publishedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Рост рынка криптовалют',
        titleTm: 'Kriptowalýuta bazarynyň ösüşi',
        titleEn: 'Cryptocurrency market growth',
        contentRu: `Рынок криптовалют показывает устойчивый рост после периода волатильности. 
        Эксперты связывают это с принятием новых нормативных актов и растущим интересом 
        институциональных инвесторов. Многие аналитики прогнозируют дальнейший рост в ближайшие месяцы.`,
        contentTm: `Kriptowalýuta bazary çalt üýtgeýän döwürden soň durnukly ösýär. 
        Hünärmenler muny täze normalaw aktlarynyň kabul edilmegi we institusional 
        goýumçylaryň artýan gyzyklanmagy bilen baglanyşdyrýarlar. Köp analitikler 
        ýakyn aýlarda mundan beýläk ösüşi çaklaýarlar.`,
        contentEn: `The cryptocurrency market is showing steady growth after a period of
        volatility. Experts attribute this to new regulations and growing interest from
        institutional investors. Many analysts forecast further growth in the coming months.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[4].id,
        authorId: users[2].id,
        publishedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Фестиваль кино: лучшие фильмы года',
        titleTm: 'Kinofestiwaly: ýylyň iň gowy filmleri',
        titleEn: 'Film festival: best films of the year',
        contentRu: `На международном кинофестивале были представлены лучшие фильмы года. 
        Жюри отметило высокий уровень кинематографа и разнообразие жанров. 
        Победители фестиваля получили награды в различных номинациях.`,
        contentTm: `Halkara kinofestiwalynda ýylyň iň gowy filmleri görkezildi. 
        Žüri kinematografyň ýokary derejesini we žanrlaryň dürlüligini belläp geçdi. 
        Festiwalyň ýeňijileri dürli nominasiýalarda baýraklar aldylar.`,
        contentEn: `The international film festival showcased the best films of the year.
        The jury noted the high level of cinematography and the variety of genres.
        Festival winners received awards in various nominations.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[5].id,
        authorId: users[1].id,
        publishedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      },
      {
        titleRu: 'Новая версия операционной системы',
        titleTm: 'Operasiýa ulgamynyň täze wersiýasy',
        titleEn: 'New version of the operating system',
        contentRu: `Вышла новая версия популярной операционной системы с множеством улучшений. 
        Обновление включает улучшенную безопасность, оптимизацию производительности и новые функции. 
        Пользователи уже могут скачать обновление и оценить новые возможности.`,
        contentTm: `Köp üýtgeşmeler bilen meşhur operasiýa ulgamynyň täze wersiýasy çykdy. 
        Täzelenme gowulaşdyrylan howpsuzlygy, işjeňligiň optimizasiýasyny we täze 
        funksiýalary öz içine alýar. Ulanyjylar eýýäm täzelenmäni göçürip alyp, 
        täze mümkinçilikleri bahalandyryp bilýärler.`,
        contentEn: `A new version of the popular operating system has been released with
        many improvements. The update includes improved security, performance optimizations
        and new features. Users can already download the update and try out the new capabilities.`,
        imageUrl: null,
        isFlash: false,
        categoryId: categories[0].id,
        authorId: users[0].id,
        publishedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
    ];

    const news = await db
      .insertInto('news')
      .values(newsData)
      .returningAll()
      .execute();

    console.log(`✅ Создано ${news.length} новостей`);

    console.log('\n🎉 База данных успешно заполнена тестовыми данными!');
    console.log('\n📋 Созданные данные:');
    console.log(`   👤 Пользователей: ${users.length}`);
    console.log(`   📁 Категорий: ${categories.length}`);
    console.log(`   📰 Новостей: ${news.length}`);
    console.log('\n🔑 Тестовые учетные данные:');
    console.log('   Email: admin@example.com | Пароль: password123');
    console.log('   Email: editor@example.com | Пароль: password123');
    console.log('   Email: author@example.com | Пароль: password123');
    console.log('   Email: user@example.com | Пароль: password123');
  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

seed();
