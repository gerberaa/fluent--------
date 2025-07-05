import React, { useState, useEffect, useCallback, useRef } from "react";

const { useStoredState } = hatch;

const FluentCryptoTapper = () => {
  // Основний стан гри
  const [coins, setCoins] = useStoredState("fluent-coins", 0);
  const [energy, setEnergy] = useStoredState("fluent-energy", 100);
  const [maxEnergy, setMaxEnergy] = useStoredState("fluent-max-energy", 100);
  const [level, setLevel] = useStoredState("fluent-level", 1);
  const [experience, setExperience] = useStoredState("fluent-experience", 0);
  const [tapPower, setTapPower] = useStoredState("fluent-tap-power", 1);
  const [passiveIncome, setPassiveIncome] = useStoredState(
    "fluent-passive-income",
    0,
  );
  const [lastOfflineTime, setLastOfflineTime] = useStoredState(
    "fluent-last-offline",
    Date.now(),
  );
  const [currentTab, setCurrentTab] = useState("game");
  const [storyChapter, setStoryChapter] = useStoredState(
    "fluent-story-chapter",
    0,
  );
  const [dailyRewardDay, setDailyRewardDay] = useStoredState(
    "fluent-daily-day",
    0,
  );
  const [lastDailyReward, setLastDailyReward] = useStoredState(
    "fluent-last-daily",
    0,
  );
  const [comboMultiplier, setComboMultiplier] = useStoredState(
    "fluent-combo",
    1,
  );
  const [lastTapTime, setLastTapTime] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Покращення
  const [upgrades, setUpgrades] = useStoredState("fluent-upgrades", {
    quantumFinger: 0,
    energyCore: 0,
    miningRig: 0,
    fluentBooster: 0,
  });

  // Досягнення
  const [achievements, setAchievements] = useStoredState(
    "fluent-achievements",
    {
      firstTap: false,
      hundred: false,
      thousand: false,
      firstUpgrade: false,
      energyMaster: false,
      passive: false,
      storyComplete: false,
      comboMaster: false,
      speedTapper: false,
    },
  );

  // Анімації
  const [floatingCoins, setFloatingCoins] = useState([]);
  const [tapEffect, setTapEffect] = useState(false);
  const [particles, setParticles] = useState([]);
  const [shockwave, setShockwave] = useState(false);
  const tapButtonRef = useRef(null);

  // Розрахунок очок досвіду для наступного рівня
  const expForNextLevel = level * 100;
  const expProgress = (experience / expForNextLevel) * 100;

  // Дані покращень з професійними іконками
  const upgradeData = {
    quantumFinger: {
      name: "Quantum Processor",
      description: "Advanced mining algorithm optimization",
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      baseCost: 50,
      multiplier: 1.5,
      effect: (level) => level + 1,
      category: "Performance",
      color: "from-yellow-400 to-orange-500",
    },
    energyCore: {
      name: "Energy Matrix",
      description: "Exponential power core expansion",
      icon: "M8 2v2.5l-1.5 1.5L8 7.5V10l-1.5 1.5L8 13v9l8-8-8-8z",
      baseCost: 100,
      multiplier: 2,
      effect: (level) => 100 + level * 50,
      category: "Capacity",
      color: "from-blue-400 to-purple-500",
    },
    miningRig: {
      name: "Mining Infrastructure",
      description: "Autonomous revenue generation",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
      baseCost: 200,
      multiplier: 2.5,
      effect: (level) => level * 2,
      category: "Passive",
      color: "from-green-400 to-emerald-500",
    },
    fluentBooster: {
      name: "Neural Accelerator",
      description: "AI-powered efficiency multiplier",
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      baseCost: 500,
      multiplier: 3,
      effect: (level) => level * 0.1,
      category: "Boost",
      color: "from-pink-400 to-red-500",
    },
  };

  // Сюжетні розділи
  const storyChapters = [
    {
      title: "System Initialization",
      description:
        "Neural interface successfully established. Connection to the Fluent network detected.",
      requirement: "Execute first mining operation",
      reward: 100,
      completed: coins > 0,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      title: "Hardware Upgrade",
      description:
        "System performance enhanced through advanced component integration.",
      requirement: "Install first hardware upgrade",
      reward: 500,
      completed: Object.values(upgrades).some((level) => level > 0),
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
    },
    {
      title: "Autonomous Operation",
      description:
        "Passive income protocols successfully deployed and operational.",
      requirement: "Reach operational level 10",
      reward: 1000,
      completed: level >= 10,
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    },
    {
      title: "Network Domination",
      description: "Competing against other miners in the global network.",
      requirement: "Accumulate 10,000 Fluent tokens",
      reward: 2000,
      completed: coins >= 10000,
      icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    },
    {
      title: "Master Node Status",
      description: "Achievement of elite mining status within the network.",
      requirement: "Attain level 50 mastery",
      reward: 5000,
      completed: level >= 50,
      icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    },
  ];

  // Лідерборд
  const [leaderboard] = useState(
    [
      {
        name: "CryptoWhale",
        coins: 50000,
        level: 45,
        status: "Master",
        avatar: "🐋",
      },
      {
        name: "QuantumMiner",
        coins: 35000,
        level: 38,
        status: "Expert",
        avatar: "⚡",
      },
      {
        name: "HashPower",
        coins: 28000,
        level: 32,
        status: "Pro",
        avatar: "💎",
      },
      {
        name: "You",
        coins: coins,
        level: level,
        status: "Rising",
        avatar: "🚀",
      },
      {
        name: "BlockChain",
        coins: 15000,
        level: 25,
        status: "Advanced",
        avatar: "🔗",
      },
      {
        name: "MiningRig",
        coins: 12000,
        level: 22,
        status: "Skilled",
        avatar: "⛏️",
      },
    ].sort((a, b) => b.coins - a.coins),
  );

  // Функція для додавання уведомлень
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // Відновлення енергії
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(prev + 1, maxEnergy));
    }, 1000);
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Пасивний дохід
  useEffect(() => {
    if (passiveIncome > 0) {
      const interval = setInterval(() => {
        setCoins((prev) => prev + passiveIncome);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [passiveIncome]);

  // Обробка офлайн доходу
  useEffect(() => {
    const now = Date.now();
    const offlineTime = Math.floor((now - lastOfflineTime) / 1000);
    if (offlineTime > 60 && passiveIncome > 0) {
      const offlineCoins = Math.min(
        offlineTime * passiveIncome,
        passiveIncome * 3600 * 4,
      );
      setCoins((prev) => prev + offlineCoins);
      addNotification(
        `Offline earnings: ${offlineCoins.toLocaleString()} FLUENT`,
        "success",
      );
    }
    setLastOfflineTime(now);
  }, []);

  // Система рівнів
  useEffect(() => {
    if (experience >= expForNextLevel) {
      setLevel((prev) => prev + 1);
      setExperience(0);
      setCoins((prev) => prev + level * 50);
      addNotification(`Level up! Reached Level ${level + 1}`, "success");
    }
  }, [experience, expForNextLevel, level]);

  // Комбо система
  useEffect(() => {
    const timer = setTimeout(() => {
      if (comboMultiplier > 1) {
        setComboMultiplier(1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [lastTapTime]);

  // SVG іконки
  const IconComponent = ({
    path,
    className = "w-6 h-6",
    color = "currentColor",
  }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke={color}
      data-oid="4_a6.ee"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={path}
        data-oid="ci3w18v"
      />
    </svg>
  );

  // Обчислення вартості покращень
  const getUpgradeCost = (upgradeType) => {
    const data = upgradeData[upgradeType];
    const currentLevel = upgrades[upgradeType];
    return Math.floor(data.baseCost * Math.pow(data.multiplier, currentLevel));
  };

  // Функція тапання з комбо
  const handleTap = useCallback(
    (e) => {
      if (energy <= 0) return;

      const now = Date.now();
      const timeSinceLastTap = now - lastTapTime;

      // Комбо система
      if (timeSinceLastTap < 1000) {
        setComboMultiplier((prev) => Math.min(prev + 0.5, 5));
      } else {
        setComboMultiplier(1);
      }
      setLastTapTime(now);

      const rect = tapButtonRef.current?.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ефекти тапання
      setTapEffect(true);
      setShockwave(true);
      setTimeout(() => setTapEffect(false), 200);
      setTimeout(() => setShockwave(false), 600);

      // Частинки при тапі
      for (let i = 0; i < 3; i++) {
        const particleId = Date.now() + Math.random() + i;
        setParticles((prev) => [
          ...prev,
          {
            id: particleId,
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 40,
            velocity: {
              x: (Math.random() - 0.5) * 100,
              y: -Math.random() * 100,
            },
          },
        ]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== particleId));
        }, 1000);
      }

      // Плаваюче число з комбо
      const earnedCoins = Math.floor(tapPower * comboMultiplier);
      const coinId = Date.now() + Math.random() + 1;
      setFloatingCoins((prev) => [
        ...prev,
        {
          id: coinId,
          x,
          y,
          amount: earnedCoins,
          combo: comboMultiplier > 1 ? comboMultiplier : null,
        },
      ]);
      setTimeout(() => {
        setFloatingCoins((prev) => prev.filter((coin) => coin.id !== coinId));
      }, 1500);

      // Додати монети та досвід
      setCoins((prev) => prev + earnedCoins);
      setExperience((prev) => prev + earnedCoins);
      setEnergy((prev) => prev - 1);

      // Досягнення
      if (!achievements.firstTap) {
        setAchievements((prev) => ({ ...prev, firstTap: true }));
        addNotification("Achievement: First Strike!", "achievement");
      }
      if (comboMultiplier >= 3 && !achievements.comboMaster) {
        setAchievements((prev) => ({ ...prev, comboMaster: true }));
        addNotification("Achievement: Combo Master!", "achievement");
      }
    },
    [
      energy,
      tapPower,
      achievements.firstTap,
      achievements.comboMaster,
      comboMultiplier,
      lastTapTime,
    ],
  );

  // Купівля покращень
  const buyUpgrade = (upgradeType) => {
    const cost = getUpgradeCost(upgradeType);
    if (coins >= cost) {
      setCoins((prev) => prev - cost);
      setUpgrades((prev) => ({
        ...prev,
        [upgradeType]: prev[upgradeType] + 1,
      }));

      // Застосування ефектів
      if (upgradeType === "quantumFinger") {
        setTapPower((prev) => prev + 1);
      } else if (upgradeType === "energyCore") {
        setMaxEnergy(upgradeData.energyCore.effect(upgrades.energyCore + 1));
      } else if (upgradeType === "miningRig") {
        setPassiveIncome(upgradeData.miningRig.effect(upgrades.miningRig + 1));
      }

      addNotification(`Upgraded ${upgradeData[upgradeType].name}!`, "success");

      if (!achievements.firstUpgrade) {
        setAchievements((prev) => ({ ...prev, firstUpgrade: true }));
        addNotification("Achievement: Enhanced!", "achievement");
      }
    }
  };

  // Отримання щоденної нагороди
  const claimDailyReward = () => {
    const now = Date.now();
    const daysPassed = Math.floor(
      (now - lastDailyReward) / (1000 * 60 * 60 * 24),
    );

    if (daysPassed >= 1) {
      const newDay = daysPassed === 1 ? dailyRewardDay + 1 : 1;
      const reward = newDay * 100;

      setCoins((prev) => prev + reward);
      setDailyRewardDay(newDay);
      setLastDailyReward(now);

      addNotification(`Daily reward claimed: ${reward} FLUENT!`, "success");
    }
  };

  // Рендер головного екрану гри
  const renderGameScreen = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black relative overflow-hidden"
      data-oid=":_b0rqe"
    >
      {/* Анімований фон */}
      <div className="absolute inset-0 opacity-20" data-oid="itloff8">
        <div
          className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_70%)]"
          data-oid="d4y6wrd"
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl opacity-30 animate-pulse"
          data-oid="64v5bqv"
        ></div>
        <div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
          data-oid="wb-r6lu"
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-32 h-32 bg-pink-500 rounded-full filter blur-2xl opacity-40 animate-bounce"
          data-oid="e88z9bn"
        ></div>
      </div>

      {/* Уведомлення */}
      <div className="fixed top-4 right-4 z-30 space-y-2" data-oid="w:33c8_">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`
            px-4 py-2 rounded-lg shadow-lg backdrop-blur-xl border transform transition-all duration-300 animate-slide-in
            ${
              notification.type === "success"
                ? "bg-green-900/50 border-green-500/50 text-green-400"
                : notification.type === "achievement"
                  ? "bg-yellow-900/50 border-yellow-500/50 text-yellow-400"
                  : "bg-blue-900/50 border-blue-500/50 text-blue-400"
            }
          `}
            data-oid="_xdq83y"
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="relative z-10 p-6" data-oid="_lvabq8">
        {/* Заголовок з анімацією */}
        <div className="text-center mb-8" data-oid="__x386.">
          <h1
            className="text-4xl font-bold text-white mb-2 tracking-wider animate-pulse"
            data-oid="1:6g-cv"
          >
            <span
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              data-oid=":kx-fa0"
            >
              FLUENT MINING
            </span>
          </h1>
          <div
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto animate-pulse"
            data-oid="_79bqq2"
          ></div>
        </div>

        {/* Статистика з іконками */}
        <div
          className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto"
          data-oid="y5kzt63"
        >
          <div
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition-all duration-300 group"
            data-oid="2.a3z06"
          >
            <div
              className="flex items-center justify-between"
              data-oid="2_pusm9"
            >
              <div data-oid="zrva6uo">
                <div
                  className="text-cyan-400 text-sm font-medium mb-1"
                  data-oid="w6v7wfj"
                >
                  BALANCE
                </div>
                <div
                  className="text-white text-xl font-bold"
                  data-oid="va4.zk6"
                >
                  {coins.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs" data-oid="rq3z.lm">
                  FLUENT
                </div>
              </div>
              <div
                className="text-cyan-400 group-hover:scale-110 transition-transform"
                data-oid="5ciuwk8"
              >
                <IconComponent
                  path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  className="w-8 h-8"
                  data-oid="3uvwa:g"
                />
              </div>
            </div>
          </div>

          <div
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-all duration-300 group"
            data-oid="bgu0rnx"
          >
            <div
              className="flex items-center justify-between"
              data-oid="t43sw4j"
            >
              <div data-oid="t5i0phd">
                <div
                  className="text-purple-400 text-sm font-medium mb-1"
                  data-oid="5-uwh.y"
                >
                  ENERGY
                </div>
                <div
                  className="text-white text-xl font-bold"
                  data-oid="lvv3jar"
                >
                  {energy}/{maxEnergy}
                </div>
                <div
                  className="w-full bg-gray-700 rounded-full h-2 mt-2"
                  data-oid="otoyzj1"
                >
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(energy / maxEnergy) * 100}%` }}
                    data-oid="eawrr.l"
                  />
                </div>
              </div>
              <div
                className="text-purple-400 group-hover:scale-110 transition-transform"
                data-oid="qe64teb"
              >
                <IconComponent
                  path="M13 10V3L4 14h7v7l9-11h-7z"
                  className="w-8 h-8"
                  data-oid="d5dkwqg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Комбо індикатор */}
        {comboMultiplier > 1 && (
          <div className="text-center mb-4 animate-bounce" data-oid="gn:a7c_">
            <div
              className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg"
              data-oid="y7sqj-r"
            >
              COMBO x{comboMultiplier.toFixed(1)}
            </div>
          </div>
        )}

        {/* Рівень з іконкою */}
        <div
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4 mb-8 max-w-md mx-auto hover:border-green-500/50 transition-all duration-300"
          data-oid="1etbhvv"
        >
          <div
            className="flex items-center justify-between mb-2"
            data-oid="t25lf5m"
          >
            <div className="flex items-center" data-oid="00qxtbb">
              <IconComponent
                path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                className="w-5 h-5 text-green-400 mr-2"
                data-oid="pwavy:x"
              />
              <span
                className="text-green-400 text-sm font-medium"
                data-oid="hvyn11w"
              >
                LEVEL {level}
              </span>
            </div>
            <span className="text-gray-400 text-xs" data-oid="gnjlyuv">
              {experience}/{expForNextLevel} XP
            </span>
          </div>
          <div
            className="w-full bg-gray-700 rounded-full h-2"
            data-oid="fb51naf"
          >
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${expProgress}%` }}
              data-oid="aqm.44z"
            />
          </div>
        </div>

        {/* Mining Interface з покращеними ефектами */}
        <div className="flex flex-col items-center mb-8" data-oid="81klu1o">
          <div className="relative mb-6" data-oid="rqjt8pk">
            {/* Ударна хвиля */}
            {shockwave && (
              <div
                className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-50"
                data-oid="vvp795m"
              ></div>
            )}

            <button
              ref={tapButtonRef}
              onClick={handleTap}
              disabled={energy <= 0}
              className={`relative w-56 h-56 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 p-1
                shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95
                ${energy <= 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-cyan-500/50"}
                ${tapEffect ? "scale-110" : ""}
                before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-cyan-500/20 before:to-purple-500/20 before:animate-pulse
              `}
              data-oid="_btnl77"
            >
              <div
                className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center relative overflow-hidden"
                data-oid="x_9.b2t"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 animate-pulse"
                  data-oid="rymd4i-"
                ></div>
                <div
                  className="text-4xl font-bold text-white z-10"
                  data-oid="-3fwp.f"
                >
                  MINE
                </div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin"
                  data-oid="m6icais"
                ></div>

                {/* Внутрішні кільця */}
                <div
                  className="absolute inset-4 rounded-full border-2 border-cyan-400/30 animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "3s",
                  }}
                  data-oid="x7r8a3c"
                ></div>
                <div
                  className="absolute inset-8 rounded-full border-2 border-purple-400/30 animate-spin"
                  style={{ animationDuration: "2s" }}
                  data-oid="57zv8g0"
                ></div>
              </div>
            </button>

            {/* Частинки з физикою */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full pointer-events-none animate-pulse"
                style={{
                  left: particle.x,
                  top: particle.y,
                  animation: "particleFloat 1s ease-out forwards",
                }}
                data-oid="z3ktncs"
              />
            ))}

            {/* Покращені плаваючі числа */}
            {floatingCoins.map((coin) => (
              <div
                key={coin.id}
                className="absolute pointer-events-none z-20"
                style={{
                  left: coin.x,
                  top: coin.y,
                  animation: "float 1.5s ease-out forwards",
                }}
                data-oid="l4buquf"
              >
                <div
                  className="text-cyan-400 text-2xl font-bold drop-shadow-lg"
                  data-oid="xcecevh"
                >
                  +{coin.amount}
                </div>
                {coin.combo && (
                  <div
                    className="text-orange-400 text-sm font-bold"
                    data-oid="49evs0g"
                  >
                    x{coin.combo.toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Статистика майнінгу з іконками */}
          <div
            className="grid grid-cols-2 gap-4 text-center"
            data-oid="_0kikh0"
          >
            <div
              className="bg-gray-800/30 backdrop-blur-xl rounded-lg p-3 border border-gray-700"
              data-oid=".e42x-i"
            >
              <div
                className="flex items-center justify-center mb-1"
                data-oid="wdwu-f1"
              >
                <IconComponent
                  path="M13 10V3L4 14h7v7l9-11h-7z"
                  className="w-5 h-5 text-yellow-400 mr-2"
                  data-oid="9fyv19x"
                />
                <div className="text-gray-400 text-sm" data-oid="4-8vs1f">
                  MINING POWER
                </div>
              </div>
              <div className="text-white text-lg font-bold" data-oid="ogb2-7b">
                {tapPower}
              </div>
            </div>
            {passiveIncome > 0 && (
              <div
                className="bg-gray-800/30 backdrop-blur-xl rounded-lg p-3 border border-gray-700"
                data-oid="04h-ek_"
              >
                <div
                  className="flex items-center justify-center mb-1"
                  data-oid="i18ljly"
                >
                  <IconComponent
                    path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    className="w-5 h-5 text-green-400 mr-2"
                    data-oid="_.m.pkz"
                  />
                  <div className="text-gray-400 text-sm" data-oid="g:k08mj">
                    PASSIVE INCOME
                  </div>
                </div>
                <div
                  className="text-green-400 text-lg font-bold"
                  data-oid="llpqqoc"
                >
                  {passiveIncome}/s
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка щоденної нагороди з іконкою */}
        <div className="text-center" data-oid="c.erpka">
          <button
            onClick={claimDailyReward}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-8 py-3 rounded-full font-bold
              hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105
              border border-purple-500/50 shadow-lg shadow-purple-500/25 flex items-center mx-auto"
            data-oid="na0o_3q"
          >
            <IconComponent
              path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              className="w-5 h-5 mr-2"
              data-oid=".t.n-ek"
            />
            DAILY REWARD
          </button>
        </div>
      </div>
    </div>
  );

  // Рендер магазину з покращеними іконками
  const renderShop = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6"
      data-oid="y5qhkqs"
    >
      <div className="max-w-6xl mx-auto" data-oid="ks.vvb_">
        <div className="text-center mb-8" data-oid="5l83t-d">
          <h2
            className="text-3xl font-bold text-white mb-2 tracking-wider"
            data-oid="kbjq4z5"
          >
            <span
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              data-oid="e:wdxk."
            >
              UPGRADE STORE
            </span>
          </h2>
          <div
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto"
            data-oid="o5n4z5c"
          ></div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-oid="6k5-0z."
        >
          {Object.entries(upgradeData).map(([key, data]) => {
            const cost = getUpgradeCost(key);
            const currentLevel = upgrades[key];
            const canAfford = coins >= cost;

            return (
              <div
                key={key}
                className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 group hover:scale-105 transform"
                data-oid="pjal.d3"
              >
                <div
                  className="flex items-center justify-between mb-4"
                  data-oid="ps8ve9_"
                >
                  <div className="flex items-center" data-oid="k2xn8lv">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${data.color} rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}
                      data-oid="j2gyqqa"
                    >
                      <IconComponent
                        path={data.icon}
                        className="w-6 h-6 text-white"
                        data-oid="2j9qqpl"
                      />
                    </div>
                    <div data-oid="83jez:n">
                      <h3
                        className="text-white font-bold text-lg"
                        data-oid="ve1hmd:"
                      >
                        {data.name}
                      </h3>
                      <div
                        className="text-cyan-400 text-xs font-medium"
                        data-oid="igbpmea"
                      >
                        {data.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right" data-oid="-1:.nl8">
                    <div
                      className="text-white text-sm flex items-center"
                      data-oid="7v2-smq"
                    >
                      <IconComponent
                        path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        className="w-4 h-4 mr-1"
                        data-oid="3:3:b.i"
                      />
                      Level {currentLevel}
                    </div>
                  </div>
                </div>

                <p
                  className="text-gray-300 text-sm mb-4 leading-relaxed"
                  data-oid="60nf8x7"
                >
                  {data.description}
                </p>

                <div
                  className="mb-4 bg-gray-900/30 rounded-lg p-3"
                  data-oid="p8wsv3d"
                >
                  <div
                    className="text-gray-400 text-sm mb-2"
                    data-oid="7kq2974"
                  >
                    CURRENT EFFECT
                  </div>
                  <div className="text-cyan-400 font-medium" data-oid="gncq4jp">
                    {key === "quantumFinger"
                      ? `+${data.effect(currentLevel)} mining power`
                      : key === "energyCore"
                        ? `${data.effect(currentLevel)} max energy`
                        : key === "miningRig"
                          ? `${data.effect(currentLevel)}/sec passive`
                          : `+${(data.effect(currentLevel) * 100).toFixed(1)}% boost`}
                  </div>
                </div>

                <button
                  onClick={() => buyUpgrade(key)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 flex items-center justify-center
                    ${
                      canAfford
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border border-green-500/50 shadow-lg shadow-green-500/25"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
                    }`}
                  data-oid=".5g.wrr"
                >
                  <IconComponent
                    path="M13 10V3L4 14h7v7l9-11h-7z"
                    className="w-5 h-5 mr-2"
                    data-oid="0u1p4mk"
                  />
                  {canAfford ? "UPGRADE" : "INSUFFICIENT FUNDS"} -{" "}
                  {cost.toLocaleString()} FLUENT
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Рендер сюжету з іконками
  const renderStory = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6"
      data-oid="aeum3.4"
    >
      <div className="max-w-4xl mx-auto" data-oid="17h0vp2">
        <div className="text-center mb-8" data-oid="kuaj_3h">
          <h2
            className="text-3xl font-bold text-white mb-2 tracking-wider"
            data-oid="x6i9xbp"
          >
            <span
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              data-oid="9imz40r"
            >
              MISSION PROTOCOL
            </span>
          </h2>
          <div
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto"
            data-oid="4:emubn"
          ></div>
        </div>

        <div className="space-y-6" data-oid="c_r58d5">
          {storyChapters.map((chapter, index) => (
            <div
              key={index}
              className={`bg-gray-800/50 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:scale-105 transform
              ${chapter.completed ? "border-green-500/50 bg-green-900/10" : "border-gray-700 hover:border-cyan-500/50"}`}
              data-oid="w-zwey:"
            >
              <div
                className="flex items-center justify-between mb-4"
                data-oid="mo.-b8z"
              >
                <div className="flex items-center" data-oid="2vlag0_">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 mr-4
                    ${chapter.completed ? "bg-green-500 border-green-400" : "bg-gray-700 border-gray-600"}`}
                    data-oid="fs.8s.r"
                  >
                    <IconComponent
                      path={chapter.icon}
                      className="w-6 h-6 text-white"
                      data-oid="5-2r:.x"
                    />
                  </div>
                  <h3
                    className="text-xl font-bold text-white"
                    data-oid="bfxxjf-"
                  >
                    {chapter.title}
                  </h3>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-sm
                  ${chapter.completed ? "bg-green-500 border-green-400 text-white" : "bg-gray-700 border-gray-600 text-gray-400"}`}
                  data-oid="_g8yla-"
                >
                  {chapter.completed ? "✓" : index + 1}
                </div>
              </div>

              <p
                className="text-gray-300 mb-4 leading-relaxed"
                data-oid="ub1qglq"
              >
                {chapter.description}
              </p>

              <div
                className="flex items-center justify-between"
                data-oid="_xl2_xn"
              >
                <div data-oid="my3-5:j">
                  <div
                    className="text-cyan-400 text-sm font-medium mb-1 flex items-center"
                    data-oid="icu3gsi"
                  >
                    <IconComponent
                      path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      className="w-4 h-4 mr-1"
                      data-oid="n:6gdfy"
                    />
                    OBJECTIVE
                  </div>
                  <div className="text-gray-400 text-sm" data-oid="xpm8a59">
                    {chapter.requirement}
                  </div>
                </div>
                <div className="text-right" data-oid="l0oy_rw">
                  <div
                    className="text-purple-400 text-sm font-medium mb-1 flex items-center justify-end"
                    data-oid="yb4ellq"
                  >
                    <IconComponent
                      path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      className="w-4 h-4 mr-1"
                      data-oid="z:5q4qc"
                    />
                    REWARD
                  </div>
                  <div
                    className={`font-bold ${chapter.completed ? "text-green-400" : "text-gray-400"}`}
                    data-oid="6exkyi3"
                  >
                    {chapter.reward.toLocaleString()} FLUENT
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Рендер лідерборду з аватарами
  const renderLeaderboard = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6"
      data-oid="5a8e6h4"
    >
      <div className="max-w-4xl mx-auto" data-oid="14dshko">
        <div className="text-center mb-8" data-oid="exdk.3p">
          <h2
            className="text-3xl font-bold text-white mb-2 tracking-wider"
            data-oid="0tgib:5"
          >
            <span
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              data-oid="rosmk7v"
            >
              GLOBAL RANKINGS
            </span>
          </h2>
          <div
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto"
            data-oid="mk0h..d"
          ></div>
        </div>

        <div
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6"
          data-oid="x4g42po"
        >
          <div className="space-y-4" data-oid="zlizu0j">
            {leaderboard.map((player, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-105 transform
                ${player.name === "You" ? "bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/50" : "bg-gray-900/30 hover:bg-gray-800/50"}
                ${index === 0 ? "border border-yellow-500/50 bg-yellow-900/10" : ""}
                ${index === 1 ? "border border-gray-400/50 bg-gray-800/20" : ""}
                ${index === 2 ? "border border-orange-500/50 bg-orange-900/10" : ""}
              `}
                data-oid="ofzkvtt"
              >
                <div className="flex items-center" data-oid="eud.8p8">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 text-xl
                    ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                        : index === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-600"
                          : index === 2
                            ? "bg-gradient-to-br from-orange-400 to-orange-600"
                            : "bg-gradient-to-br from-purple-500 to-cyan-500"
                    }`}
                    data-oid="n2h5zma"
                  >
                    {index < 3 ? index + 1 : player.avatar}
                  </div>
                  <div data-oid="l-azmg1">
                    <div className="flex items-center" data-oid="4t2:pq6">
                      <p
                        className="text-white font-bold mr-2"
                        data-oid="iaqr407"
                      >
                        {player.name}
                      </p>
                      {index === 0 && (
                        <IconComponent
                          path="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          className="w-5 h-5 text-yellow-400"
                          data-oid="myih8s2"
                        />
                      )}
                    </div>
                    <div
                      className="flex items-center text-gray-400 text-sm"
                      data-oid="rd..3mx"
                    >
                      <IconComponent
                        path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        className="w-4 h-4 mr-1"
                        data-oid="v.132y4"
                      />
                      Level {player.level} • {player.status}
                    </div>
                  </div>
                </div>
                <div className="text-right" data-oid="05uuz-s">
                  <div
                    className="flex items-center text-white font-bold"
                    data-oid="05gzlek"
                  >
                    <IconComponent
                      path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      className="w-4 h-4 mr-1"
                      data-oid="eiurzq3"
                    />
                    {player.coins.toLocaleString()}
                  </div>
                  <p className="text-gray-400 text-sm" data-oid="14mly0q">
                    FLUENT
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Рендер досягнень з іконками
  const renderAchievements = () => (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black p-6"
      data-oid="8.1a6e."
    >
      <div className="max-w-4xl mx-auto" data-oid="h1lal:r">
        <div className="text-center mb-8" data-oid="8q.doby">
          <h2
            className="text-3xl font-bold text-white mb-2 tracking-wider"
            data-oid="jy89tr6"
          >
            <span
              className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
              data-oid="y7cztyy"
            >
              ACHIEVEMENTS
            </span>
          </h2>
          <div
            className="w-32 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto"
            data-oid="cjfs1cf"
          ></div>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          data-oid="6reiv2d"
        >
          {[
            {
              key: "firstTap",
              title: "First Strike",
              description: "Execute your first mining operation",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              key: "hundred",
              title: "Accumulator",
              description: "Reach 100 FLUENT balance",
              icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
            },
            {
              key: "thousand",
              title: "Millionaire",
              description: "Accumulate 1,000 FLUENT tokens",
              icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
            },
            {
              key: "firstUpgrade",
              title: "Enhanced",
              description: "Install first system upgrade",
              icon: "M7 14l3-3 3 3",
            },
            {
              key: "energyMaster",
              title: "Power Core",
              description: "Achieve 200 maximum energy",
              icon: "M8 2v2.5l-1.5 1.5L8 7.5V10l-1.5 1.5L8 13v9l8-8-8-8z",
            },
            {
              key: "passive",
              title: "Automated",
              description: "Generate 50 passive income",
              icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
            },
            {
              key: "comboMaster",
              title: "Combo Master",
              description: "Achieve 3x combo multiplier",
              icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
            },
            {
              key: "speedTapper",
              title: "Speed Demon",
              description: "Tap 100 times in 60 seconds",
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((achievement) => (
            <div
              key={achievement.key}
              className={`bg-gray-800/50 backdrop-blur-xl border rounded-xl p-6 transition-all duration-300 hover:scale-105 transform
              ${achievements[achievement.key] ? "border-green-500/50 bg-green-900/10" : "border-gray-700 hover:border-cyan-500/50"}`}
              data-oid="tg5djv5"
            >
              <div className="flex items-center mb-4" data-oid="fs4eyaw">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 transition-all duration-300
                  ${achievements[achievement.key] ? "bg-gradient-to-br from-green-500 to-emerald-500" : "bg-gray-700"}`}
                  data-oid="ijhxxkg"
                >
                  <IconComponent
                    path={achievement.icon}
                    className="w-6 h-6 text-white"
                    data-oid="zggckqu"
                  />
                </div>
                <div data-oid="stqpwe-">
                  <h3
                    className="text-white font-bold text-lg"
                    data-oid="uzo950t"
                  >
                    {achievement.title}
                  </h3>
                  <p className="text-gray-300 text-sm" data-oid="8jk.9y6">
                    {achievement.description}
                  </p>
                </div>
              </div>

              <div
                className={`text-center py-2 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center
                ${achievements[achievement.key] ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"}`}
                data-oid="a4fj22v"
              >
                <IconComponent
                  path={
                    achievements[achievement.key]
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      : "M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  }
                  className="w-4 h-4 mr-2"
                  data-oid="6pu22sg"
                />
                {achievements[achievement.key] ? "COMPLETED" : "LOCKED"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black" data-oid="9tve5p5">
      {/* Навігаційне меню з іконками */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 z-50"
        data-oid="8-qd.ax"
      >
        <div
          className="flex justify-around items-center p-3"
          data-oid="0kpq6jj"
        >
          {[
            { key: "game", icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "MINE" },
            {
              key: "shop",
              icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
              label: "STORE",
            },
            {
              key: "story",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
              label: "MISSIONS",
            },
            {
              key: "leaderboard",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              label: "RANKINGS",
            },
            {
              key: "achievements",
              icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
              label: "ACHIEVEMENTS",
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 font-medium group
                ${
                  currentTab === tab.key
                    ? "bg-gradient-to-t from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              data-oid="oia-gze"
            >
              <IconComponent
                path={tab.icon}
                className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform"
                data-oid="j8:gx1:"
              />
              <div className="text-xs tracking-wide" data-oid="iflg_hu">
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="pb-20" data-oid="xza4743">
        {currentTab === "game" && renderGameScreen()}
        {currentTab === "shop" && renderShop()}
        {currentTab === "story" && renderStory()}
        {currentTab === "leaderboard" && renderLeaderboard()}
        {currentTab === "achievements" && renderAchievements()}
      </div>

      {/* Покращені стилі для анімації */}
      <style jsx data-oid="g82jav.">{`
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 1;
          }
          100% {
            transform: translateY(-80px);
            opacity: 0;
          }
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes slide-in {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0%);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FluentCryptoTapper;
