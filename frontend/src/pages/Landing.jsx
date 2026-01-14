import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link2, BarChart3, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/App";

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-purple-500/5 pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img 
              src="/MyTrack-logo-main.svg" 
              alt="MyTrack" 
              className="h-8 sm:h-10 w-auto"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin' : '/multilinks'}>
                <Button variant="ghost" data-testid="nav-panel-btn" className="px-3 sm:px-4 font-gilroy-600">Панель</Button>
              </Link>
              <Link to="/page/new">
                <Button data-testid="nav-create-btn" className="bg-primary hover:bg-primary/90 rounded-full px-4 sm:px-6 text-sm sm:text-base font-gilroy-600">
                  Создать
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" data-testid="nav-login-btn" className="px-3 sm:px-4 font-gilroy-600">Войти</Button>
              </Link>
              <Link to="/register">
                <Button data-testid="nav-signup-btn" className="bg-primary hover:bg-primary/90 rounded-full px-4 sm:px-6 text-sm sm:text-base font-gilroy-600">
                  Начать
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {/* Hero Section - Full Screen */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-16 items-center pt-20 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="font-gilroy-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-[0.95] mb-4 sm:mb-6">
              СОЗДАЙ<br />
              <span className="text-primary">МУЛЬТИССЫЛКУ</span><br />
              ДЛЯ СВОЕЙ <span className="text-primary">МУЗЫКИ</span>
            </h1>
            <p className="font-gilroy-300 text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
              Стильные страницы для ваших релизов. Одна ссылка — все платформы.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link to={isAuthenticated ? "/page/new" : "/register"}>
                <Button 
                  data-testid="hero-get-started-btn"
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-gilroy-600 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  Создать страницу
                </Button>
              </Link>
              <Link to="/demo">
                <Button 
                  variant="outline" 
                  data-testid="hero-demo-btn"
                  className="w-full sm:w-auto rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-gilroy-600 border-white/10 hover:bg-white/5"
                >
                  Демо
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Visual - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="relative mx-auto w-[280px] xl:w-[320px]">
              {/* Phone Frame */}
              <div className="rounded-[40px] border-4 border-zinc-800 bg-zinc-900 p-2 shadow-2xl">
                <div className="rounded-[32px] overflow-hidden bg-gradient-to-b from-purple-900/50 to-zinc-900 aspect-[9/16]">
                  {/* Mock Content */}
                  <div className="p-6 pt-12 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 mb-4" />
                    <h3 className="font-gilroy-600 text-xl">Artist Name</h3>
                    <p className="text-sm text-muted-foreground font-gilroy-300 mb-6">Song Name</p>
                    
                    <div className="w-full space-y-3">
                      {["Apple Music", "Spotify", "YouTube"].map((platform) => (
                        <div 
                          key={platform}
                          className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-gilroy-600"
                        >
                          {platform}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full" />
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="font-gilroy-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">ВСЁ ЧТО НУЖНО</h2>
            <p className="font-gilroy-300 text-muted-foreground text-sm sm:text-base md:text-lg max-w-lg mx-auto px-4">
              Простые инструменты для продвижения музыки и роста аудитории
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: Link2,
                title: "Умные ссылки",
                description: "Одна ссылка для всех платформ. Spotify, Apple Music, YouTube и другие."
              },
              {
                icon: BarChart3,
                title: "Аналитика",
                description: "Отслеживайте просмотры и клики. Узнайте откуда приходят ваши фанаты."
              },
              {
                icon: Zap,
                title: "Быстрый старт",
                description: "Создайте страницу за минуты. Без программирования."
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 rounded-2xl bg-zinc-800/50 border border-white/5 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                </div>
                <h3 className="font-gilroy-600 text-lg sm:text-xl mb-2 sm:mb-3">{feature.title}</h3>
                <p className="font-gilroy-300 text-muted-foreground text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="font-gilroy-600 text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 leading-tight">
              НАЧНИ ДЕЛИТЬСЯ<br />МУЗЫКОЙ СЕГОДНЯ
            </h2>
            <p className="font-gilroy-300 text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 px-4">
              Присоединяйтесь к тысячам артистов, использующих MyTrack.
            </p>
            <Link to="/register">
              <Button 
                data-testid="cta-get-started-btn"
                className="bg-primary hover:bg-primary/90 rounded-full px-8 sm:px-10 py-5 sm:py-6 text-base sm:text-lg font-gilroy-600 shadow-lg shadow-primary/20 transition-all hover:scale-105"
              >
                Начать бесплатно
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="/MyTrack-logo-main.svg" 
              alt="MyTrack" 
              className="h-6 sm:h-8 w-auto"
            />
          </div>
          <p className="font-gilroy-300 text-muted-foreground text-sm text-center sm:text-left">© 2026 MyTrack. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
