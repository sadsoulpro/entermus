import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";
import { Check, Crown, Zap, X } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";

const PLANS = [
  {
    name: "FREE",
    price: "0₽",
    description: "Для начинающих",
    features: [
      { text: "До 3 мультиссылок", included: true },
      { text: "Базовая аналитика", included: true },
      { text: "Поддомены", included: false },
      { text: "Детальная география", included: false },
      { text: "AI генерация обложек", included: false },
      { text: "Верификация профиля", included: false },
      { text: "Убрать брендинг", included: false },
    ],
    highlighted: false,
  },
  {
    name: "PRO",
    price: "499₽",
    period: "/мес",
    description: "Для профессионалов",
    features: [
      { text: "Безлимит мультиссылок", included: true },
      { text: "Полная аналитика", included: true },
      { text: "Безлимит поддоменов", included: true },
      { text: "География по странам/городам", included: true },
      { text: "AI генерация обложек", included: true },
      { text: "Верификация профиля", included: true },
      { text: "Убрать брендинг MyTrack", included: true },
      { text: "Приоритетная поддержка", included: true },
    ],
    highlighted: true,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const currentPlan = user?.plan || "free";

  return (
    <Sidebar>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display mb-4"
          >
            Тарифные планы
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto"
          >
            Выберите план, который подходит именно вам
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative p-6 sm:p-8 rounded-3xl border ${
                plan.highlighted 
                  ? 'bg-gradient-to-b from-primary/10 to-transparent border-primary/30' 
                  : 'bg-zinc-900/50 border-white/5'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-purple-600 rounded-full text-xs font-medium">
                  Популярный
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.highlighted ? (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Zap className="w-5 h-5 text-zinc-400" />
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-sm' : 'text-sm text-zinc-500'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                <Button disabled className="w-full" variant="outline">
                  Текущий план
                </Button>
              ) : plan.highlighted ? (
                <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                  <Crown className="w-4 h-4 mr-2" />
                  Перейти на PRO
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  Бесплатно
                </Button>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Есть вопросы? Напишите нам на{" "}
            <a href="mailto:support@mytrack.cc" className="text-primary hover:underline">
              support@mytrack.cc
            </a>
          </p>
        </motion.div>
      </div>
    </Sidebar>
  );
}
