// <stdin>
import React, { useState, useEffect, useCallback, useRef } from "https://esm.sh/react@18.2.0";

// API функції для роботи з сервером
const API_BASE = 'http://localhost:3001/api';

const api = {
  async getUser() {
    const response = await fetch(`${API_BASE}/user/default`);
    return response.json();
  },
  
  async saveUser(data) {
    const response = await fetch(`${API_BASE}/user/default/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async click() {
    const response = await fetch(`${API_BASE}/user/default/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
};

// Кастомний хук для роботи з сервером
const useServerState = (key, defaultValue) => {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  const setServerValue = async (newValue) => {
    const valueToSet = typeof newValue === 'function' ? newValue(value) : newValue;
    setValue(valueToSet);
    
    // Зберігаємо на сервері
    try {
      await api.saveUser({ [key]: valueToSet });
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  };

  return [value, setServerValue, loading];
};

var FluentCryptoTapper = () => {
  // Основний стан гри з сервера
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Локальний стан для UI
  const [currentTab, setCurrentTab] = useState("game");
  const [lastTapTime, setLastTapTime] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [tapEffect, setTapEffect] = useState(false);
  const [particles, setParticles] = useState([]);
  const [shockwave, setShockwave] = useState(false);
  const tapButtonRef = useRef(null);

  // Завантаження даних з сервера при старті
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const data = await api.getUser();
        setGameState(data);
      } catch (error) {
        console.error('Error loading game state:', error);
        // Fallback до початкових значень
        setGameState({
          coins: 0,
          energy: 100,
          maxEnergy: 100,
          level: 1,
          experience: 0,
          tapPower: 1,
          passiveIncome: 0,
          lastOfflineTime: Date.now(),
          upgrades: {
            quantumFinger: 0,
            energyCore: 0,
            miningRig: 0,
            fluentBooster: 0
          },
          achievements: {
            firstTap: false,
            hundred: false,
            thousand: false,
            firstUpgrade: false,
            energyMaster: false,
            passive: false,
            storyComplete: false,
            comboMaster: false,
            speedTapper: false
          },
          storyChapter: 0,
          dailyRewardDay: 0,
          lastDailyReward: 0,
          comboMultiplier: 1
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadGameState();
  }, []);

  // Оновлення даних на сервері
  const updateGameState = async (updates) => {
    if (!gameState) return;
    
    const newState = { ...gameState, ...updates };
    setGameState(newState);
    
    try {
      await api.saveUser(updates);
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  // Розрахунки
  const expForNextLevel = gameState?.level ? gameState.level * 100 : 100;
  const expProgress = gameState?.experience ? (gameState.experience / expForNextLevel) * 100 : 0;

  // Дані покращень
  const upgradeData = {
    quantumFinger: {
      name: "Quantum Processor",
      description: "Advanced mining algorithm optimization",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      baseCost: 50,
      multiplier: 1.5,
      effect: (level2) => level2 + 1,
      category: "Performance",
      color: "from-yellow-400 to-orange-500"
    },
    energyCore: {
      name: "Energy Matrix",
      description: "Exponential power core expansion",
      icon: "M8 2v2.5l-1.5 1.5L8 7.5V10l-1.5 1.5L8 13v9l8-8-8-8z",
      baseCost: 100,
      multiplier: 2,
      effect: (level2) => 100 + level2 * 50,
      category: "Capacity",
      color: "from-blue-400 to-purple-500"
    },
    miningRig: {
      name: "Mining Infrastructure",
      description: "Autonomous revenue generation",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
      baseCost: 200,
      multiplier: 2.5,
      effect: (level2) => level2 * 2,
      category: "Passive",
      color: "from-green-400 to-emerald-500"
    },
    fluentBooster: {
      name: "Neural Accelerator",
      description: "AI-powered efficiency multiplier",
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      baseCost: 500,
      multiplier: 3,
      effect: (level2) => level2 * 0.1,
      category: "Boost",
      color: "from-pink-400 to-red-500"
    }
  };

  // Сюжетні розділи
  const storyChapters = [
    {
      title: "System Initialization",
      description: "Neural interface successfully established. Connection to the Fluent network detected.",
      requirement: "Execute first mining operation",
      reward: 100,
      completed: gameState?.coins ? gameState.coins > 0 : false,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Hardware Upgrade",
      description: "System performance enhanced through advanced component integration.",
      requirement: "Install first hardware upgrade",
      reward: 500,
      completed: gameState?.upgrades ? Object.values(gameState.upgrades).some((level2) => level2 > 0) : false,
      icon: "M13 10V3L4 14h7v7l9-11h-7z"
    },
    {
      title: "Autonomous Operation",
      description: "Passive income protocols successfully deployed and operational.",
      requirement: "Reach operational level 10",
      reward: 1e3,
      completed: gameState?.level ? gameState.level >= 10 : false,
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
    },
    {
      title: "Network Domination",
      description: "Competing against other miners in the global network.",
      requirement: "Accumulate 10,000 Fluent tokens",
      reward: 2e3,
      completed: gameState?.coins ? gameState.coins >= 1e4 : false,
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
    },
    {
      title: "Master Node Status",
      description: "Achievement of elite mining status within the network.",
      requirement: "Attain level 50 mastery",
      reward: 5e3,
      completed: gameState?.level ? gameState.level >= 50 : false,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    }
  ];

  // Лідерборд
  const [leaderboard] = useState([
    { name: "CryptoWhale", coins: 5e4, level: 45, status: "Master", avatar: "\u{1F40B}" },
    { name: "QuantumMiner", coins: 35e3, level: 38, status: "Expert", avatar: "\u26A1" },
    { name: "HashPower", coins: 28e3, level: 32, status: "Pro", avatar: "\u{1F48E}" },
    { name: "You", coins: gameState?.coins || 0, level: gameState?.level || 1, status: "Rising", avatar: "\u{1F680}" },
    { name: "BlockChain", coins: 15e3, level: 25, status: "Advanced", avatar: "\u{1F517}" },
    { name: "MiningRig", coins: 12e3, level: 22, status: "Skilled", avatar: "\u26CF\uFE0F" }
  ].sort((a, b) => b.coins - a.coins));

  // Функція для додавання уведомлень
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3e3);
  };

  // Відновлення енергії
  useEffect(() => {
    if (!gameState) return;
    
    const interval = setInterval(() => {
      if (gameState.energy < gameState.maxEnergy) {
        updateGameState({ energy: Math.min(gameState.energy + 1, gameState.maxEnergy) });
      }
    }, 1e3);
    return () => clearInterval(interval);
  }, [gameState?.energy, gameState?.maxEnergy]);

  // Пасивний дохід
  useEffect(() => {
    if (!gameState || gameState.passiveIncome <= 0) return;
    
    const interval = setInterval(() => {
      updateGameState({ coins: gameState.coins + gameState.passiveIncome });
    }, 1e3);
    return () => clearInterval(interval);
  }, [gameState?.passiveIncome]);

  // Обробка офлайн доходу
  useEffect(() => {
    if (!gameState) return;
    
    const now = Date.now();
    const offlineTime = Math.floor((now - gameState.lastOfflineTime) / 1e3);
    if (offlineTime > 60 && gameState.passiveIncome > 0) {
      const offlineCoins = Math.min(offlineTime * gameState.passiveIncome, gameState.passiveIncome * 3600 * 4);
      updateGameState({ 
        coins: gameState.coins + offlineCoins,
        lastOfflineTime: now
      });
      addNotification(`Offline earnings: ${offlineCoins.toLocaleString()} FLUENT`, "success");
    } else {
      updateGameState({ lastOfflineTime: now });
    }
  }, []);

  // Система рівнів
  useEffect(() => {
    if (!gameState || gameState.experience < expForNextLevel) return;
    
    updateGameState({
      level: gameState.level + 1,
      experience: 0,
      coins: gameState.coins + gameState.level * 50
    });
    addNotification(`Level up! Reached Level ${gameState.level + 1}`, "success");
  }, [gameState?.experience, expForNextLevel]);

  // Комбо система
  useEffect(() => {
    const timer = setTimeout(() => {
      if (gameState?.comboMultiplier && gameState.comboMultiplier > 1) {
        updateGameState({ comboMultiplier: 1 });
      }
    }, 3e3);
    return () => clearTimeout(timer);
  }, [lastTapTime]);

  const IconComponent = ({ path, className = "w-6 h-6", color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { className, fill: "none", viewBox: "0 0 24 24", stroke: color }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: path }));

  const getUpgradeCost = (upgradeType) => {
    const data = upgradeData[upgradeType];
    const currentLevel = gameState?.upgrades?.[upgradeType] || 0;
    return Math.floor(data.baseCost * Math.pow(data.multiplier, currentLevel));
  };

  const handleTap = useCallback(async (e) => {
    if (!gameState || gameState.energy <= 0) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;
    
    if (timeSinceLastTap < 1e3) {
      updateGameState({ comboMultiplier: Math.min((gameState.comboMultiplier || 1) + 0.5, 5) });
    } else {
      updateGameState({ comboMultiplier: 1 });
    }
    setLastTapTime(now);

    const rect = tapButtonRef.current?.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTapEffect(true);
    setShockwave(true);
    setTimeout(() => setTapEffect(false), 200);
    setTimeout(() => setShockwave(false), 600);

    for (let i = 0; i < 3; i++) {
      const particleId = Date.now() + Math.random() + i;
      setParticles((prev) => [...prev, {
        id: particleId,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        velocity: { x: (Math.random() - 0.5) * 100, y: -Math.random() * 100 }
      }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== particleId));
      }, 1e3);
    }

    const earnedCoins = Math.floor(gameState.tapPower * (gameState.comboMultiplier || 1));
    const coinId = Date.now() + Math.random() + 1;
    setFloatingCoins((prev) => [...prev, {
      id: coinId,
      x,
      y,
      amount: earnedCoins,
      combo: (gameState.comboMultiplier || 1) > 1 ? gameState.comboMultiplier : null
    }]);
    setTimeout(() => {
      setFloatingCoins((prev) => prev.filter((coin) => coin.id !== coinId));
    }, 1500);

    // Оновлюємо стан через API
    updateGameState({
      coins: gameState.coins + earnedCoins,
      experience: gameState.experience + earnedCoins,
      energy: gameState.energy - 1
    });

    if (!gameState.achievements.firstTap) {
      updateGameState({
        achievements: { ...gameState.achievements, firstTap: true }
      });
      addNotification("Achievement: First Strike!", "achievement");
    }
    
    if ((gameState.comboMultiplier || 1) >= 3 && !gameState.achievements.comboMaster) {
      updateGameState({
        achievements: { ...gameState.achievements, comboMaster: true }
      });
      addNotification("Achievement: Combo Master!", "achievement");
    }
  }, [gameState, lastTapTime]);

  const buyUpgrade = async (upgradeType) => {
    if (!gameState) return;
    
    const cost = getUpgradeCost(upgradeType);
    if (gameState.coins >= cost) {
      const newUpgrades = { ...gameState.upgrades, [upgradeType]: gameState.upgrades[upgradeType] + 1 };
      const updates = {
        coins: gameState.coins - cost,
        upgrades: newUpgrades
      };

      if (upgradeType === "quantumFinger") {
        updates.tapPower = gameState.tapPower + 1;
      } else if (upgradeType === "energyCore") {
        updates.maxEnergy = upgradeData.energyCore.effect(newUpgrades.energyCore);
      } else if (upgradeType === "miningRig") {
        updates.passiveIncome = upgradeData.miningRig.effect(newUpgrades.miningRig);
      } else if (upgradeType === "fluentBooster") {
        updates.tapPower = gameState.tapPower + upgradeData.fluentBooster.effect(newUpgrades.fluentBooster);
      }

      updateGameState(updates);

      if (!gameState.achievements.firstUpgrade) {
        updateGameState({
          achievements: { ...gameState.achievements, firstUpgrade: true }
        });
        addNotification("Achievement: First Upgrade!", "achievement");
      }
    }
  };

  const claimDailyReward = async () => {
    if (!gameState) return;
    
    const now = Date.now();
    const lastReward = gameState.lastDailyReward;
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - lastReward >= dayInMs) {
      const reward = 100 + gameState.dailyRewardDay * 50;
      updateGameState({
        coins: gameState.coins + reward,
        dailyRewardDay: gameState.dailyRewardDay + 1,
        lastDailyReward: now
      });
      addNotification(`Daily reward claimed: ${reward} FLUENT`, "success");
    }
  };

  // Loading screen
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement("div", { className: "animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500 mx-auto mb-4" }), /* @__PURE__ */ React.createElement("h2", { className: "text-2xl font-bold text-white" }, "Loading Fluent Network...")));
  }

  const renderGameScreen = () => /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 opacity-20" }, /* @__PURE__ */ React.createElement("div", { className: "absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_70%)]" }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-30 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-pulse", style: { animationDelay: "1s" } }), /* @__PURE__ */ React.createElement("div", { className: "absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500 rounded-full filter blur-2xl opacity-40 animate-bounce" })), /* @__PURE__ */ React.createElement("div", { className: "fixed top-4 right-4 z-30 space-y-2" }, notifications.map((notification) => /* @__PURE__ */ React.createElement("div", { key: notification.id, className: `
            px-4 py-2 rounded-lg shadow-lg backdrop-blur-xl border transform transition-all duration-300 animate-slide-in
            ${notification.type === "success" ? "bg-green-900/50 border-green-500/50 text-green-400" : notification.type === "achievement" ? "bg-yellow-900/50 border-yellow-500/50 text-yellow-400" : "bg-blue-900/50 border-blue-500/50 text-blue-400"}
          ` }, notification.message))), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 p-6" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h1", { className: "text-4xl font-bold text-white mb-2 tracking-wider animate-pulse" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" }, "FLUENT MINING")), /* @__PURE__ */ React.createElement("div", { className: "w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto animate-pulse" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300 group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 text-sm font-medium mb-1" }, "BALANCE"), /* @__PURE__ */ React.createElement("div", { className: "text-white text-xl font-bold" }, gameState.coins.toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 text-xs" }, "FLUENT")), /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 group-hover:scale-110 transition-transform" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", className: "w-8 h-8" })))), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 group" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-purple-400 text-sm font-medium mb-1" }, "ENERGY"), /* @__PURE__ */ React.createElement("div", { className: "text-white text-xl font-bold" }, gameState.energy, "/", gameState.maxEnergy), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-gray-700 rounded-full h-2 mt-2" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300",
      style: { width: `${gameState.energy / gameState.maxEnergy * 100}%` }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "text-purple-400 group-hover:scale-110 transition-transform" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M13 10V3L4 14h7v7l9-11h-7z", className: "w-8 h-8" }))))), gameState.comboMultiplier > 1 && /* @__PURE__ */ React.createElement("div", { className: "text-center mb-4 animate-bounce" }, /* @__PURE__ */ React.createElement("div", { className: "inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg" }, "COMBO x", gameState.comboMultiplier.toFixed(1))), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 mb-8 max-w-md mx-auto hover:border-green-500/50 transition-all duration-300" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", className: "w-5 h-5 text-green-400 mr-2" }), /* @__PURE__ */ React.createElement("span", { className: "text-green-400 text-sm font-medium" }, "LEVEL ", gameState.level)), /* @__PURE__ */ React.createElement("span", { className: "text-gray-400 text-xs" }, gameState.experience, "/", expForNextLevel, " XP")), /* @__PURE__ */ React.createElement("div", { className: "w-full bg-gray-700 rounded-full h-2" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300",
      style: { width: `${expProgress}%` }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "relative mb-6" }, gameState.shockwave && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-50" }), /* @__PURE__ */ React.createElement(
    "button",
    {
      ref: tapButtonRef,
      onClick: handleTap,
      disabled: gameState.energy <= 0,
      className: `relative w-56 h-56 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 p-1
                shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95
                ${gameState.energy <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-cyan-500/50"}
                ${gameState.tapEffect ? "scale-110" : ""}
                before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-cyan-500/20 before:to-purple-500/20 before:animate-pulse
              `
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full h-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse" }), /* @__PURE__ */ React.createElement("div", { className: "text-4xl font-bold text-white z-10" }, "MINE"), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 rounded-full border-4 border-white/20 animate-spin" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-4 rounded-full border-2 border-cyan-400/30 animate-spin", style: { animationDirection: "reverse", animationDuration: "3s" } }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-8 rounded-full border-2 border-purple-400/30 animate-spin", style: { animationDuration: "2s" } }))
  ), gameState.particles.map((particle) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: particle.id,
      className: "absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full pointer-events-none animate-pulse",
      style: {
        left: particle.x,
        top: particle.y,
        animation: "particleFloat 1s ease-out forwards"
      }
    }
  )), gameState.floatingCoins.map((coin) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: coin.id,
      className: "absolute pointer-events-none z-20",
      style: {
        left: coin.x,
        top: coin.y,
        animation: "float 1.5s ease-out forwards"
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 text-2xl font-bold drop-shadow-lg" }, "+", coin.amount),
    coin.combo && /* @__PURE__ */ React.createElement("div", { className: "text-orange-400 text-sm font-bold" }, "x", coin.combo.toFixed(1))
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/30 backdrop-blur-xl rounded-lg p-3 border border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center mb-1" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M13 10V3L4 14h7v7l9-11h-7z", className: "w-5 h-5 text-yellow-400 mr-2" }), /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 text-sm" }, "MINING POWER")), /* @__PURE__ */ React.createElement("div", { className: "text-white text-lg font-bold" }, gameState.tapPower)), gameState.passiveIncome > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/30 backdrop-blur-xl rounded-lg p-3 border border-gray-700" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center mb-1" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", className: "w-5 h-5 text-green-400 mr-2" }), /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 text-sm" }, "PASSIVE INCOME")), /* @__PURE__ */ React.createElement("div", { className: "text-green-400 text-lg font-bold" }, gameState.passiveIncome, "/s")))), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: claimDailyReward,
      className: "bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-3 rounded-full font-bold\n              hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105\n              border border-purple-500/50 shadow-lg shadow-purple-500/25 flex items-center mx-auto"
    },
    /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", className: "w-5 h-5 mr-2" }),
    "DAILY REWARD"
  ))));

  const renderShop = () => /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-2 tracking-wider" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" }, "UPGRADE STORE")), /* @__PURE__ */ React.createElement("div", { className: "w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, Object.entries(upgradeData).map(([key, data]) => {
    const cost = getUpgradeCost(key);
    const currentLevel = gameState?.upgrades?.[key] || 0;
    const canAfford = gameState?.coins >= cost;
    return /* @__PURE__ */ React.createElement("div", { key, className: "bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group hover:scale-105 transform" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: `w-12 h-12 bg-gradient-to-br ${data.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform` }, /* @__PURE__ */ React.createElement(IconComponent, { path: data.icon, className: "w-6 h-6 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-lg" }, data.name), /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 text-xs font-medium" }, data.category))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-white text-sm flex items-center" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", className: "w-4 h-4 mr-1" }), "Level ", currentLevel))), /* @__PURE__ */ React.createElement("p", { className: "text-gray-300 text-sm mb-4 leading-relaxed" }, data.description), /* @__PURE__ */ React.createElement("div", { className: "mb-4 bg-gray-900/30 rounded-lg p-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 text-sm mb-2" }, "CURRENT EFFECT"), /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 font-medium" }, key === "quantumFinger" ? `+${data.effect(currentLevel)} mining power` : key === "energyCore" ? `${data.effect(currentLevel)} max energy` : key === "miningRig" ? `${data.effect(currentLevel)}/sec passive` : `+${(data.effect(currentLevel) * 100).toFixed(1)}% boost`)), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => buyUpgrade(key),
        disabled: !canAfford,
        className: `w-full py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center
                    ${canAfford ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border border-green-500/50 shadow-lg shadow-green-500/25" : "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"}`
      },
      /* @__PURE__ */ React.createElement(IconComponent, { path: "M13 10V3L4 14h7v7l9-11h-7z", className: "w-5 h-5 mr-2" }),
      canAfford ? "UPGRADE" : "INSUFFICIENT FUNDS",
      " - ",
      cost.toLocaleString(),
      " FLUENT"
    ));
  }))));

  const renderStory = () => /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-2 tracking-wider" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" }, "MISSION PROTOCOL")), /* @__PURE__ */ React.createElement("div", { className: "w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto" })), /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, storyChapters.map((chapter, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: `bg-gray-800/50 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:scale-105 transform
              ${chapter.completed ? "border-green-500/50 bg-green-900/10" : "border-gray-700 hover:border-cyan-500/50"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center border-2 mr-4
                    ${chapter.completed ? "bg-green-500 border-green-400" : "bg-gray-700 border-gray-600"}` }, /* @__PURE__ */ React.createElement(IconComponent, { path: chapter.icon, className: "w-6 h-6 text-white" })), /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-white" }, chapter.title)), /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm
                  ${chapter.completed ? "bg-green-500 border-green-400 text-white" : "bg-gray-700 border-gray-600 text-gray-400"}` }, chapter.completed ? "\u2713" : index + 1)), /* @__PURE__ */ React.createElement("p", { className: "text-gray-300 mb-4 leading-relaxed" }, chapter.description), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-cyan-400 text-sm font-medium mb-1 flex items-center" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", className: "w-4 h-4 mr-1" }), "OBJECTIVE"), /* @__PURE__ */ React.createElement("div", { className: "text-gray-400 text-sm" }, chapter.requirement)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-purple-400 text-sm font-medium mb-1 flex items-center justify-end" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", className: "w-4 h-4 mr-1" }), "REWARD"), /* @__PURE__ */ React.createElement("div", { className: `font-bold ${chapter.completed ? "text-green-400" : "text-gray-400"}` }, chapter.reward.toLocaleString(), " FLUENT"))))))));

  const renderLeaderboard = () => /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-2 tracking-wider" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" }, "GLOBAL RANKINGS")), /* @__PURE__ */ React.createElement("div", { className: "w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto" })), /* @__PURE__ */ React.createElement("div", { className: "bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, leaderboard.map((player, index) => /* @__PURE__ */ React.createElement("div", { key: index, className: `flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 transform
                ${player.name === "You" ? "bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/50" : "bg-gray-900/30 hover:bg-gray-800/50"}
                ${index === 0 ? "border border-yellow-500/50 bg-yellow-900/10" : ""}
                ${index === 1 ? "border border-gray-400/50 bg-gray-800/20" : ""}
                ${index === 2 ? "border border-orange-500/50 bg-orange-900/10" : ""}
              ` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("div", { className: `w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 text-xl
                    ${index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-600" : index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" : "bg-gradient-to-br from-purple-500 to-cyan-500"}` }, index < 3 ? index + 1 : player.avatar), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-white font-bold mr-2" }, player.name), index === 0 && /* @__PURE__ */ React.createElement(IconComponent, { path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", className: "w-5 h-5 text-yellow-400" })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center text-gray-400 text-sm" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", className: "w-4 h-4 mr-1" }), "Level ", player.level, " \u2022 ", player.status))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center text-white font-bold" }, /* @__PURE__ */ React.createElement(IconComponent, { path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z", className: "w-4 h-4 mr-1" }), player.coins.toLocaleString()), /* @__PURE__ */ React.createElement("p", { className: "text-gray-400 text-sm" }, "FLUENT"))))))));

  const renderAchievements = () => /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-4xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("h2", { className: "text-3xl font-bold text-white mb-2 tracking-wider" }, /* @__PURE__ */ React.createElement("span", { className: "bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent" }, "ACHIEVEMENTS")), /* @__PURE__ */ React.createElement("div", { className: "w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
    { key: "firstTap", title: "First Strike", description: "Execute your first mining operation", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    { key: "hundred", title: "Accumulator", description: "Reach 100 FLUENT balance", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { key: "thousand", title: "Millionaire", description: "Accumulate 1,000 FLUENT tokens", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { key: "firstUpgrade", title: "Enhanced", description: "Install first system upgrade", icon: "M7 14l3-3 3 3" },
    { key: "energyMaster", title: "Power Core", description: "Achieve 200 maximum energy", icon: "M8 2v2.5l-1.5 1.5L8 7.5V10l-1.5 1.5L8 13v9l8-8-8-8z" },
    { key: "passive", title: "Automated", description: "Generate 50 passive income", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" },
    { key: "comboMaster", title: "Combo Master", description: "Achieve 3x combo multiplier", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    { key: "speedTapper", title: "Speed Demon", description: "Tap 100 times in 60 seconds", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
  ].map((achievement) => /* @__PURE__ */ React.createElement("div", { key: achievement.key, className: `bg-gray-800/50 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:scale-105 transform
              ${gameState?.achievements[achievement.key] ? "border-green-500/50 bg-green-900/10" : "border-gray-700 hover:border-cyan-500/50"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center mb-4" }, /* @__PURE__ */ React.createElement("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-all duration-300
                  ${gameState?.achievements[achievement.key] ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gray-700"}` }, /* @__PURE__ */ React.createElement(IconComponent, { path: achievement.icon, className: "w-6 h-6 text-white" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-white font-bold text-lg" }, achievement.title), /* @__PURE__ */ React.createElement("p", { className: "text-gray-300 text-sm" }, achievement.description))), /* @__PURE__ */ React.createElement("div", { className: `text-center py-2 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center
                ${gameState?.achievements[achievement.key] ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"}` }, /* @__PURE__ */ React.createElement(IconComponent, { path: gameState?.achievements[achievement.key] ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", className: "w-4 h-4 mr-2" }), gameState?.achievements[achievement.key] ? "COMPLETED" : "LOCKED"))))));

  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen bg-black" }, /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-around items-center p-3" }, [
    { key: "game", icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "MINE" },
    { key: "shop", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", label: "STORE" },
    { key: "story", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", label: "MISSIONS" },
    { key: "leaderboard", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "RANKINGS" },
    { key: "achievements", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", label: "ACHIEVEMENTS" }
  ].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.key,
      onClick: () => setCurrentTab(tab.key),
      className: `flex flex-col items-center p-2 rounded-lg transition-all duration-200 font-medium group
                ${currentTab === tab.key ? "bg-gradient-to-t from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`
    },
    /* @__PURE__ */ React.createElement(IconComponent, { path: tab.icon, className: "w-5 h-5 mb-1 group-hover:scale-110 transition-transform" }),
    /* @__PURE__ */ React.createElement("div", { className: "text-xs tracking-wide" }, tab.label)
  )))), /* @__PURE__ */ React.createElement("div", { className: "pb-20" }, currentTab === "game" && renderGameScreen(), currentTab === "shop" && renderShop(), currentTab === "story" && renderStory(), currentTab === "leaderboard" && renderLeaderboard(), currentTab === "achievements" && renderAchievements()), /* @__PURE__ */ React.createElement("style", { jsx: true }, `
        @keyframes float {
          0% { transform: translateY(0px); opacity: 1; }
          100% { transform: translateY(-80px); opacity: 0; }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: 1; }
          100% { transform: translateY(-60px) translateX(20px); opacity: 0; }
        }
        
        @keyframes slide-in {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0%); opacity: 1; }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `));
};

var stdin_default = FluentCryptoTapper;
export {
  stdin_default as default
};
