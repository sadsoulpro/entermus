import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api, useAuth } from "@/App";
import { toast } from "sonner";
import { 
  Users, FileText, Shield, Ban, Check, Eye, ExternalLink,
  Globe, MapPin, MousePointer, Share2, QrCode, Cpu, 
  HardDrive, Activity, TrendingUp, Server, Music,
  BadgeCheck, X, Award, Settings, Crown, ChevronDown,
  UserCog, Sliders, Save
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import Sidebar from "@/components/Sidebar";

// Role badges configuration
const ROLE_CONFIG = {
  owner: { label: "Владелец", color: "bg-yellow-500/20 text-yellow-400", icon: Crown },
  admin: { label: "Админ", color: "bg-purple-500/20 text-purple-400", icon: Shield },
  moderator: { label: "Модератор", color: "bg-blue-500/20 text-blue-400", icon: UserCog },
  user: { label: "Пользователь", color: "bg-zinc-500/20 text-zinc-400", icon: Users }
};

const PLAN_CONFIG = {
  free: { label: "Free", color: "bg-zinc-500/20 text-zinc-400" },
  pro: { label: "Pro", color: "bg-blue-500/20 text-blue-400" },
  ultimate: { label: "Ultimate", color: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400" }
};

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [globalAnalytics, setGlobalAnalytics] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [planConfigs, setPlanConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  const isOwner = currentUser?.role === "owner";

  useEffect(() => {
    fetchData();
    fetchGlobalAnalytics();
    fetchSystemMetrics();
    fetchVerificationRequests();
    fetchPlanConfigs();
    
    const metricsInterval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(metricsInterval);
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, pagesRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/pages")
      ]);
      setUsers(usersRes.data);
      setPages(pagesRes.data);
    } catch (error) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalAnalytics = async () => {
    try {
      const response = await api.get("/admin/analytics/global");
      setGlobalAnalytics(response.data);
    } catch (error) {
      console.error("Failed to fetch global analytics");
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      const response = await api.get("/admin/system/metrics");
      setSystemMetrics(response.data);
    } catch (error) {
      console.error("Failed to fetch system metrics");
    }
  };

  const fetchVerificationRequests = async () => {
    try {
      const response = await api.get("/admin/verification/requests");
      setVerificationRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch verification requests");
    }
  };

  const fetchPlanConfigs = async () => {
    try {
      const response = await api.get("/admin/plan-configs");
      setPlanConfigs(response.data);
    } catch (error) {
      console.error("Failed to fetch plan configs");
    }
  };

  // User Management Functions
  const toggleUserBan = async (userId, currentBanned) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { is_banned: !currentBanned });
      toast.success(currentBanned ? "Пользователь разбанен" : "Пользователь забанен");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Не удалось обновить пользователя");
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Роль изменена на ${ROLE_CONFIG[newRole].label}`);
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Не удалось изменить роль");
    }
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
      await api.put(`/admin/users/${userId}/plan`, { plan: newPlan });
      toast.success(`План изменён на ${PLAN_CONFIG[newPlan].label}`);
      fetchData();
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Не удалось изменить план");
    }
  };

  const toggleUserVerify = async (userId, currentVerified) => {
    try {
      await api.put(`/admin/users/${userId}/verify`, { is_verified: !currentVerified });
      toast.success(currentVerified ? "Верификация снята" : "Пользователь верифицирован");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Не удалось обновить верификацию");
    }
  };

  // Plan Config Management
  const updatePlanConfig = async (planName, updates) => {
    try {
      await api.put(`/admin/plan-configs/${planName}`, updates);
      toast.success(`Настройки плана ${planName} обновлены`);
      fetchPlanConfigs();
      setEditingPlan(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Не удалось обновить настройки плана");
    }
  };

  // Legacy functions for verification requests
  const approveVerification = async (userId) => {
    try {
      await api.put(`/admin/verification/${userId}/approve`);
      toast.success("Верификация одобрена");
      fetchVerificationRequests();
      fetchData();
    } catch (error) {
      toast.error("Не удалось одобрить верификацию");
    }
  };

  const rejectVerification = async (userId) => {
    try {
      await api.put(`/admin/verification/${userId}/reject`);
      toast.success("Верификация отклонена");
      fetchVerificationRequests();
      fetchData();
    } catch (error) {
      toast.error("Не удалось отклонить верификацию");
    }
  };

  const togglePageStatus = async (pageId) => {
    try {
      const response = await api.put(`/admin/pages/${pageId}/disable`);
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error("Не удалось обновить страницу");
    }
  };

  // Country flags mapping
  const COUNTRY_FLAGS = {
    "Россия": "🇷🇺", "США": "🇺🇸", "Украина": "🇺🇦", "Беларусь": "🇧🇾",
    "Казахстан": "🇰🇿", "Германия": "🇩🇪", "ФРГ": "🇩🇪", "Великобритания": "🇬🇧",
    "Франция": "🇫🇷", "Италия": "🇮🇹", "Испания": "🇪🇸", "Польша": "🇵🇱",
    "Нидерланды": "🇳🇱", "Канада": "🇨🇦", "Австралия": "🇦🇺", "Китай": "🇨🇳",
    "Япония": "🇯🇵", "Индия": "🇮🇳", "Бразилия": "🇧🇷", "Турция": "🇹🇷",
    "Гонконг": "🇭🇰", "Сингапур": "🇸🇬", "Латвия": "🇱🇻", "Литва": "🇱🇹",
    "Эстония": "🇪🇪", "Грузия": "🇬🇪", "Армения": "🇦🇲", "Азербайджан": "🇦🇿",
    "Узбекистан": "🇺🇿", "Молдова": "🇲🇩", "Сербия": "🇷🇸",
    "Неизвестно": "🌍", "Unknown": "🌍",
  };

  const getCountryFlag = (country) => COUNTRY_FLAGS[country] || "🌍";
  const getCountryName = (country) => (country && country !== "Unknown" && country !== "Неизвестно") ? country : "Неизвестно";

  const getProgressColor = (percent) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl sm:text-2xl font-semibold">Админ-панель</h1>
            {currentUser?.role && (
              <span className={`px-2 py-1 rounded-full text-xs ${ROLE_CONFIG[currentUser.role]?.color}`}>
                {ROLE_CONFIG[currentUser.role]?.label}
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Управление пользователями, планами и мониторинг
          </p>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 sm:mb-6">
            <TabsList className="bg-zinc-900 border border-white/5 inline-flex min-w-max">
              <TabsTrigger value="users" data-testid="tab-users" className="text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Пользователи
              </TabsTrigger>
              <TabsTrigger value="plans" data-testid="tab-plans" className="text-xs sm:text-sm">
                <Sliders className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Планы
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics" className="text-xs sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Аналитика
              </TabsTrigger>
              <TabsTrigger value="system" data-testid="tab-system" className="text-xs sm:text-sm">
                <Server className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                VPS
              </TabsTrigger>
              <TabsTrigger value="verification" data-testid="tab-verification" className="text-xs sm:text-sm">
                <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Заявки
                {verificationRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-[10px] sm:text-xs">
                    {verificationRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pages" data-testid="tab-pages" className="text-xs sm:text-sm">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Страницы
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Users Tab - Enhanced */}
          <TabsContent value="users">
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Всего</p>
                  <p className="text-xl font-bold">{users.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Активных</p>
                  <p className="text-xl font-bold text-green-400">{users.filter(u => !u.is_banned && u.status === 'active').length}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Забанено</p>
                  <p className="text-xl font-bold text-red-400">{users.filter(u => u.is_banned).length}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">Верифицировано</p>
                  <p className="text-xl font-bold text-primary">{users.filter(u => u.is_verified || u.verified).length}</p>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-3">
                {users.map((user, i) => {
                  const RoleIcon = ROLE_CONFIG[user.role]?.icon || Users;
                  const isBanned = user.is_banned || user.status === 'blocked';
                  const isVerified = user.is_verified || user.verified;
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`p-4 rounded-xl border ${isBanned ? 'bg-red-950/20 border-red-500/20' : 'bg-zinc-900/50 border-white/5'}`}
                      data-testid={`user-row-${user.id}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            user.role === 'owner' ? 'bg-yellow-500/20' :
                            user.role === 'admin' ? 'bg-purple-500/20' : 'bg-primary/20'
                          }`}>
                            <RoleIcon className={`w-5 h-5 ${
                              user.role === 'owner' ? 'text-yellow-400' :
                              user.role === 'admin' ? 'text-purple-400' : 'text-primary'
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{user.username}</p>
                              {isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${ROLE_CONFIG[user.role]?.color}`}>
                                {ROLE_CONFIG[user.role]?.label}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${PLAN_CONFIG[user.plan]?.color}`}>
                                {PLAN_CONFIG[user.plan]?.label}
                              </span>
                              {isBanned && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400">
                                  Забанен
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm pl-[52px] lg:pl-0">
                          <div className="text-center">
                            <p className="font-medium">{user.page_count || 0}</p>
                            <p className="text-[10px] text-muted-foreground">страниц</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pl-[52px] lg:pl-0 flex-wrap">
                          {/* Verify Button */}
                          {user.role !== 'owner' && (
                            <Button
                              size="sm"
                              variant={isVerified ? "outline" : "default"}
                              onClick={() => toggleUserVerify(user.id, isVerified)}
                              className="text-xs"
                            >
                              <BadgeCheck className="w-3 h-3 mr-1" />
                              {isVerified ? "Снять" : "Выдать"}
                            </Button>
                          )}

                          {/* Plan Selector */}
                          {user.role !== 'owner' && (
                            <select
                              value={user.plan}
                              onChange={(e) => updateUserPlan(user.id, e.target.value)}
                              className="h-8 px-2 rounded-md bg-zinc-800 border border-white/10 text-xs cursor-pointer"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="ultimate">Ultimate</option>
                            </select>
                          )}

                          {/* Role Selector (Owner only) */}
                          {isOwner && user.role !== 'owner' && (
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="h-8 px-2 rounded-md bg-zinc-800 border border-white/10 text-xs cursor-pointer"
                            >
                              <option value="user">Пользователь</option>
                              <option value="moderator">Модератор</option>
                              <option value="admin">Админ</option>
                            </select>
                          )}

                          {/* Ban/Unban Button */}
                          {user.role !== 'owner' && user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant={isBanned ? "default" : "destructive"}
                              onClick={() => toggleUserBan(user.id, isBanned)}
                              className="text-xs"
                            >
                              {isBanned ? (
                                <><Check className="w-3 h-3 mr-1" /> Разбанить</>
                              ) : (
                                <><Ban className="w-3 h-3 mr-1" /> Забанить</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Plans Tab - NEW */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Настройки планов</h2>
                <p className="text-xs text-muted-foreground">Изменения применяются ко всем пользователям плана</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {planConfigs.map((config) => (
                  <motion.div
                    key={config.plan_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border ${
                      config.plan_name === 'ultimate' ? 'bg-gradient-to-br from-purple-950/50 to-pink-950/50 border-purple-500/20' :
                      config.plan_name === 'pro' ? 'bg-blue-950/30 border-blue-500/20' :
                      'bg-zinc-900/50 border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold capitalize">{config.plan_name}</h3>
                      {config.plan_name === 'ultimate' && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>

                    <div className="space-y-4">
                      {/* Max Pages Limit */}
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">Лимит страниц</label>
                        <input
                          type="number"
                          value={editingPlan === config.plan_name ? 
                            (planConfigs.find(p => p.plan_name === config.plan_name)?.max_pages_limit || 0) :
                            config.max_pages_limit
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setPlanConfigs(prev => prev.map(p => 
                              p.plan_name === config.plan_name ? {...p, max_pages_limit: value} : p
                            ));
                            setEditingPlan(config.plan_name);
                          }}
                          className="w-full h-9 px-3 rounded-lg bg-zinc-800 border border-white/10 text-sm"
                          min="-1"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">-1 = безлимит</p>
                      </div>

                      {/* Boolean toggles */}
                      <div className="space-y-2">
                        {[
                          { key: 'can_use_custom_design', label: 'Кастомный дизайн' },
                          { key: 'has_analytics', label: 'Аналитика' },
                          { key: 'has_advanced_analytics', label: 'Расширенная аналитика' },
                          { key: 'can_remove_branding', label: 'Убрать брендинг' },
                          { key: 'priority_support', label: 'Приоритетная поддержка' }
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs">{label}</span>
                            <input
                              type="checkbox"
                              checked={config[key] || false}
                              onChange={(e) => {
                                setPlanConfigs(prev => prev.map(p => 
                                  p.plan_name === config.plan_name ? {...p, [key]: e.target.checked} : p
                                ));
                                setEditingPlan(config.plan_name);
                              }}
                              className="w-4 h-4 rounded bg-zinc-700 border-white/10"
                            />
                          </label>
                        ))}
                      </div>

                      {/* Save Button */}
                      {editingPlan === config.plan_name && (
                        <Button
                          onClick={() => {
                            const currentConfig = planConfigs.find(p => p.plan_name === config.plan_name);
                            updatePlanConfig(config.plan_name, {
                              max_pages_limit: currentConfig.max_pages_limit,
                              can_use_custom_design: currentConfig.can_use_custom_design,
                              has_analytics: currentConfig.has_analytics,
                              has_advanced_analytics: currentConfig.has_advanced_analytics,
                              can_remove_branding: currentConfig.can_remove_branding,
                              priority_support: currentConfig.priority_support
                            });
                          }}
                          className="w-full mt-2"
                          size="sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Сохранить
                        </Button>
                      )}
                    </div>

                    {/* Users count */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs text-muted-foreground">
                        Пользователей: <span className="text-white font-medium">
                          {users.filter(u => u.plan === config.plan_name).length}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Global Analytics Tab */}
          <TabsContent value="analytics">
            {globalAnalytics ? (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {[
                    { icon: Users, label: "Пользователей", value: globalAnalytics.total_users, color: "text-blue-500" },
                    { icon: FileText, label: "Страниц", value: globalAnalytics.total_pages, color: "text-purple-500" },
                    { icon: Eye, label: "Просмотров", value: globalAnalytics.total_views, color: "text-primary" },
                    { icon: MousePointer, label: "Кликов", value: globalAnalytics.total_clicks, color: "text-green-500" },
                    { icon: Share2, label: "Репостов", value: globalAnalytics.total_shares, color: "text-blue-400" },
                    { icon: QrCode, label: "QR сканов", value: globalAnalytics.total_qr_scans, color: "text-violet-500" }
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-white/5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-xs text-muted-foreground">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{(stat.value || 0).toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Timeline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5"
                  >
                    <h3 className="text-lg font-semibold mb-4">Динамика за 30 дней</h3>
                    {globalAnalytics.timeline?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={globalAnalytics.timeline}>
                          <defs>
                            <linearGradient id="adminColorClicks" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                          <YAxis stroke="#71717a" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="clicks" stroke="#d946ef" fillOpacity={1} fill="url(#adminColorClicks)" name="Клики" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-muted-foreground">Нет данных</div>
                    )}
                  </motion.div>
                  
                  {/* Geography */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">По странам</h3>
                    </div>
                    {globalAnalytics.by_country?.length > 0 ? (
                      <div className="space-y-3">
                        {globalAnalytics.by_country.slice(0, 5).map((item, idx) => {
                          const maxClicks = globalAnalytics.by_country[0]?.clicks || 1;
                          const percentage = ((item.clicks / maxClicks) * 100).toFixed(0);
                          return (
                            <div key={idx} className="flex items-center gap-3">
                              <span className="text-lg w-6">{getCountryFlag(item.country)}</span>
                              <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>{getCountryName(item.country)}</span>
                                  <span className="text-muted-foreground">{item.clicks}</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.5, delay: 0.4 + idx * 0.05 }}
                                    className="h-full bg-primary rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[160px] flex items-center justify-center text-muted-foreground">Нет данных</div>
                    )}
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">Загрузка аналитики...</div>
            )}
          </TabsContent>

          {/* System Metrics Tab */}
          <TabsContent value="system">
            {systemMetrics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* CPU */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Cpu className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">CPU</h3>
                    </div>
                    <p className="text-3xl font-bold mb-2">{systemMetrics.cpu?.percent?.toFixed(1)}%</p>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(systemMetrics.cpu?.percent)} rounded-full transition-all`}
                        style={{ width: `${systemMetrics.cpu?.percent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{systemMetrics.cpu?.count} cores</p>
                  </motion.div>

                  {/* Memory */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Память</h3>
                    </div>
                    <p className="text-3xl font-bold mb-2">{systemMetrics.memory?.percent?.toFixed(1)}%</p>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(systemMetrics.memory?.percent)} rounded-full transition-all`}
                        style={{ width: `${systemMetrics.memory?.percent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {(systemMetrics.memory?.used / 1024 / 1024 / 1024).toFixed(1)} / {(systemMetrics.memory?.total / 1024 / 1024 / 1024).toFixed(1)} GB
                    </p>
                  </motion.div>

                  {/* Disk */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="w-5 h-5 text-purple-500" />
                      <h3 className="font-semibold">Диск</h3>
                    </div>
                    <p className="text-3xl font-bold mb-2">{systemMetrics.disk?.percent?.toFixed(1)}%</p>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(systemMetrics.disk?.percent)} rounded-full transition-all`}
                        style={{ width: `${systemMetrics.disk?.percent}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {(systemMetrics.disk?.used / 1024 / 1024 / 1024).toFixed(1)} / {(systemMetrics.disk?.total / 1024 / 1024 / 1024).toFixed(1)} GB
                    </p>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">Загрузка метрик...</div>
            )}
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <div className="space-y-6">
              {/* Pending Requests */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  Ожидающие заявки
                </h3>
                {verificationRequests.filter(r => r.status === 'pending').length > 0 ? (
                  <div className="space-y-3">
                    {verificationRequests.filter(r => r.status === 'pending').map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-zinc-900/50 border border-white/5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold">{req.artist_name}</span>
                              <span className="text-sm text-muted-foreground">(@{req.username})</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 truncate">{req.email}</p>
                            <div className="text-sm mb-2">
                              <span className="text-muted-foreground">Соц. сети: </span>
                              <span className="text-zinc-300 break-all">{req.social_links}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Подана: {new Date(req.created_at).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button size="sm" onClick={() => approveVerification(req.user_id)} className="bg-green-600 hover:bg-green-700">
                              <Check className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Одобрить</span>
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectVerification(req.user_id)}>
                              <X className="w-4 h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Отклонить</span>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 bg-zinc-900/30 rounded-xl">Нет ожидающих заявок</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages">
            <div className="space-y-3">
              {pages.map((page, i) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="p-4 rounded-xl bg-zinc-900/50 border border-white/5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                        {page.cover_image ? (
                          <img src={page.cover_image.startsWith('/') ? `${process.env.REACT_APP_BACKEND_URL}${page.cover_image}` : page.cover_image}
                            alt={page.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{page.title}</p>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            page.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>{page.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          by {page.user?.username || "Unknown"} • /{page.slug}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pl-[60px] sm:pl-0">
                      <div className="text-right">
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {page.views || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">{page.total_clicks || 0} кликов</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                        </a>
                        <Button
                          variant={page.status === "active" ? "destructive" : "default"}
                          size="sm"
                          onClick={() => togglePageStatus(page.id)}
                        >
                          {page.status === "active" ? "Отключить" : "Включить"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {pages.length === 0 && (
                <p className="text-center text-muted-foreground py-10">Страницы не найдены</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Sidebar>
  );
}
