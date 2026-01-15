import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Sidebar from "@/components/Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

const getFaqData = (t) => [
  {
    category: { en: "General Questions", ru: "Общие вопросы", es: "Preguntas generales" },
    subtitle: { en: "For beginners", ru: "Для новичков", es: "Para principiantes" },
    items: [
      {
        question: { en: "What is MyTrack?", ru: "Что такое MyTrack?", es: "¿Qué es MyTrack?" },
        answer: { 
          en: "MyTrack is a tool for artists that combines all links to streaming platforms (Spotify, Apple Music, YouTube Music, etc.) on one beautiful page.",
          ru: "Это инструмент для артистов, который объединяет все ссылки на стриминговые платформы (Spotify, Apple Music, VK Музыка и др.) на одной красивой странице.",
          es: "MyTrack es una herramienta para artistas que combina todos los enlaces a plataformas de streaming (Spotify, Apple Music, YouTube Music, etc.) en una página hermosa."
        }
      },
      {
        question: { en: "Is it free?", ru: "Это бесплатно?", es: "¿Es gratis?" },
        answer: {
          en: "The basic functionality for creating pages is available for free.",
          ru: "Основной функционал создания страниц доступен бесплатно.",
          es: "La funcionalidad básica para crear páginas está disponible de forma gratuita."
        }
      }
    ]
  },
  {
    category: { en: "Technical Questions", ru: "Технические вопросы", es: "Preguntas técnicas" },
    subtitle: { en: "How it works", ru: "Процесс", es: "Cómo funciona" },
    items: [
      {
        question: { en: "How do I add my track?", ru: "Как добавить свой трек?", es: "¿Cómo agrego mi canción?" },
        answer: {
          en: "Simply paste a link to your release from any streaming service (e.g., Spotify or Apple Music) into the search field, and our service will automatically pull links from other platforms.",
          ru: "Просто вставьте ссылку на ваш релиз из любого стриминга (например, Spotify или Apple Music) в поле поиска, и наш сервис автоматически подтянет ссылки на другие площадки.",
          es: "Simplemente pega un enlace a tu lanzamiento de cualquier servicio de streaming (por ejemplo, Spotify o Apple Music) en el campo de búsqueda, y nuestro servicio extraerá automáticamente los enlaces de otras plataformas."
        }
      },
      {
        question: { en: "Can I customize the design?", ru: "Могу ли я изменить оформление?", es: "¿Puedo personalizar el diseño?" },
        answer: {
          en: "Yes, you can upload your own cover and customize the order of platform buttons.",
          ru: "Да, вы можете загрузить свою обложку и настроить порядок отображения кнопок платформ.",
          es: "Sí, puedes subir tu propia portada y personalizar el orden de los botones de las plataformas."
        }
      },
      {
        question: { en: "What is a 'slug'?", ru: 'Что такое "Вид ссылки"?', es: "¿Qué es un 'slug'?" },
        answer: {
          en: "It's the unique name of your page in the URL. For example: mytrack.cc/mysong - the word 'mysong' is the slug.",
          ru: "Это уникальное имя вашей страницы в адресной строке. Например: mytrack.cc/mysong, слово mysong — это и есть вид ссылки.",
          es: "Es el nombre único de tu página en la URL. Por ejemplo: mytrack.cc/mysong - la palabra 'mysong' es el slug."
        }
      }
    ]
  },
  {
    category: { en: "Analytics & Promotion", ru: "Аналитика и продвижение", es: "Analíticas y promoción" },
    subtitle: { en: "Statistics", ru: "Статистика", es: "Estadísticas" },
    items: [
      {
        question: { en: "Where can I see view counts?", ru: "Где я могу увидеть количество просмотров?", es: "¿Dónde puedo ver el conteo de vistas?" },
        answer: {
          en: "View statistics are displayed in your dashboard under the Analytics tab.",
          ru: "Статистика просмотров отображается в вашем личном кабинете во вкладке Аналитика.",
          es: "Las estadísticas de vistas se muestran en tu panel de control en la pestaña Analíticas."
        }
      },
      {
        question: { en: "What is the QR code for?", ru: "Зачем нужен QR-код?", es: "¿Para qué es el código QR?" },
        answer: {
          en: "We automatically create a QR code for each page. You can download it and place it on posters or social media so fans can listen with a single scan.",
          ru: "Мы автоматически создаем QR-код для каждой страницы. Вы можете скачать его и разместить на афишах или в соцсетях, чтобы фанаты могли перейти к прослушиванию за одно сканирование.",
          es: "Creamos automáticamente un código QR para cada página. Puedes descargarlo y colocarlo en pósters o redes sociales para que los fans puedan escuchar con un solo escaneo."
        }
      }
    ]
  },
  {
    category: { en: "Troubleshooting", ru: "Решение проблем", es: "Solución de problemas" },
    subtitle: { en: "Help", ru: "Помощь", es: "Ayuda" },
    items: [
      {
        question: { en: "The service didn't find my track automatically. What should I do?", ru: "Сервис не нашел мой трек автоматически, что делать?", es: "El servicio no encontró mi canción automáticamente. ¿Qué debo hacer?" },
        answer: {
          en: "If auto-search didn't work (for example, if the release just came out), you can manually add platform links in the page editor.",
          ru: "Если автопоиск не сработал (например, если релиз только что вышел), вы можете добавить ссылки на площадки вручную в редакторе страницы.",
          es: "Si la búsqueda automática no funcionó (por ejemplo, si el lanzamiento acaba de salir), puedes agregar los enlaces de las plataformas manualmente en el editor de páginas."
        }
      },
      {
        question: { en: "How do I delete a page?", ru: "Как удалить страницу?", es: "¿Cómo elimino una página?" },
        answer: {
          en: "In your dashboard, click on the trash icon next to the release. Warning: this action is irreversible.",
          ru: "В личном кабинете нажмите на иконку корзины рядом с нужным релизом. Внимание: это действие необратимо.",
          es: "En tu panel de control, haz clic en el ícono de papelera junto al lanzamiento. Advertencia: esta acción es irreversible."
        }
      }
    ]
  }
];

export default function FAQ() {
  const { t, language } = useLanguage();
  const faqData = getFaqData(t);
  
  const getText = (obj) => obj[language] || obj.en;
  
  return (
    <Sidebar>
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display">{t('faq', 'title')}</h1>
              <p className="text-sm text-muted-foreground">{t('faq', 'subtitle')}</p>
            </div>
          </div>
        </div>
        
        {/* FAQ Categories */}
        <div className="space-y-6 sm:space-y-8">
          {faqData.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-white/5"
            >
              {/* Category Header */}
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-semibold">{getText(category.category)}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{getText(category.subtitle)}</p>
              </div>
              
              {/* Accordion */}
              <Accordion type="single" collapsible className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem 
                    key={itemIndex} 
                    value={`${categoryIndex}-${itemIndex}`}
                    className="border border-white/5 rounded-xl px-4 bg-zinc-800/30 data-[state=open]:bg-zinc-800/50"
                  >
                    <AccordionTrigger className="text-sm sm:text-base text-left hover:no-underline py-3 sm:py-4">
                      {getText(item.question)}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-4">
                      {getText(item.answer)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
        
        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
        >
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('faq', 'noAnswer')}
          </p>
          <Link to="/support" className="text-sm text-primary mt-1 hover:underline">
            {t('faq', 'contactUs')}
          </Link>
        </motion.div>
      </div>
    </Sidebar>
  );
}
