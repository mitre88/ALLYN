import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  AbsoluteFill,
  Sequence,
} from 'remotion';

// Colores de marca ALLYN
const COLORS = {
  purple: '#6B21A8',
  gold: '#F59E0B',
  rose: '#E11D48',
  dark: '#0F172A',
  white: '#FFFFFF',
};

// Componente de partículas flotantes
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (i * 5) % 100,
    y: ((i * 7) % 100),
    size: 2 + (i % 4),
    speed: 0.3 + (i % 3) * 0.1,
    delay: i * 3,
  }));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {particles.map((p) => {
        const y = ((frame * p.speed + p.delay) % 120) - 10;
        const opacity = interpolate(
          y,
          [-10, 10, 90, 110],
          [0, 0.6, 0.6, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: COLORS.gold,
              opacity,
              boxShadow: `0 0 ${p.size * 2}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Logo animado
const AnimatedLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring-like animation using interpolate with easing
  const scale = interpolate(
    frame,
    [0, 30],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  
  // Add bounce effect
  const bounceScale = scale < 1 
    ? scale + Math.sin(scale * Math.PI) * 0.1 * (1 - scale)
    : 1;

  const glowOpacity = interpolate(frame, [30, 60], [0.3, 0.8], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `scale(${Math.max(0, bounceScale)})`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Glow effect */}
      <div
        style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.purple}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}, transparent 70%)`,
          filter: 'blur(20px)',
        }}
      />
      
      {/* Logo text */}
      <h1
        style={{
          fontSize: 180,
          fontWeight: 900,
          background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.gold})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.05em',
          textShadow: `0 0 60px ${COLORS.purple}50`,
        }}
      >
        ALLYN
      </h1>
    </div>
  );
};

// Tagline animado
const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  
  const words = ['Transforma', 'tu', 'Vida'];
  
  return (
    <div
      style={{
        display: 'flex',
        gap: '0.4em',
        marginTop: 40,
        justifyContent: 'center',
      }}
    >
      {words.map((word, i) => {
        const startFrame = 40 + i * 8;
        const opacity = interpolate(
          frame,
          [startFrame, startFrame + 15],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const y = interpolate(
          frame,
          [startFrame, startFrame + 15],
          [20, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const color = i === 2 ? COLORS.rose : COLORS.white;

        return (
          <span
            key={i}
            style={{
              fontSize: 48,
              fontWeight: 300,
              color,
              opacity,
              transform: `translateY(${y}px)`,
              letterSpacing: '0.05em',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Categorías animadas
const Categories: React.FC = () => {
  const frame = useCurrentFrame();
  
  const categories = [
    { name: 'SALUD', color: '#10B981', emoji: '💚' },
    { name: 'DINERO', color: '#F59E0B', emoji: '💛' },
    { name: 'AMOR', color: '#E11D48', emoji: '❤️' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: 60,
        marginTop: 80,
        justifyContent: 'center',
      }}
    >
      {categories.map((cat, i) => {
        const startFrame = 80 + i * 10;
        const opacity = interpolate(
          frame,
          [startFrame, startFrame + 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const scale = interpolate(
          frame,
          [startFrame, startFrame + 20],
          [0.5, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              opacity,
              transform: `scale(${scale})`,
            }}
          >
            <span style={{ fontSize: 40 }}>{cat.emoji}</span>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: cat.color,
                letterSpacing: '0.2em',
              }}
            >
              {cat.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Componente principal
export const AllynIntro: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Background gradient animation
  const bgPosition = interpolate(frame, [0, 300], [0, 100]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${20 + bgPosition * 0.1}% 20%, ${COLORS.purple}40 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${COLORS.rose}30 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, ${COLORS.gold}20 0%, transparent 70%),
          ${COLORS.dark}
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Particles />
      
      <Sequence from={0} durationInFrames={300}>
        <AnimatedLogo />
      </Sequence>
      
      <Sequence from={35} durationInFrames={265}>
        <Tagline />
      </Sequence>
      
      <Sequence from={75} durationInFrames={225}>
        <Categories />
      </Sequence>
      
      {/* Subtle footer */}
      <Sequence from={120} durationInFrames={180}>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            textAlign: 'center',
            opacity: interpolate(frame, [120, 140], [0, 0.5], { extrapolateRight: 'clamp' }),
          }}
        >
          <p style={{ color: COLORS.white, fontSize: 18, letterSpacing: '0.3em' }}>
            PLATAFORMA DE DESARROLLO PERSONAL
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
