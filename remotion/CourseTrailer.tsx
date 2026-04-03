import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion"

export type CourseTrailerProps = {
  title: string
  subtitle: string
  pillars: string[]
  pillarDescriptions: string[]
  pillarColors: string[]
  brandName: string
  ctaText: string
}

// ── Scene 1: Brand Intro (0-3s = 0-90 frames) ──────────────────
function SceneBrandIntro({
  brandName,
  subtitle,
}: {
  brandName: string
  subtitle: string
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const logoScale = spring({ frame, fps, config: { damping: 12 } })
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  })
  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: "clamp",
  })
  const subtitleY = interpolate(frame, [30, 50], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  })
  const lineWidth = interpolate(frame, [20, 50], [0, 200], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  })

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #1a1520 0%, #09090b 70%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Ambient pulse */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,149,26,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          transform: `scale(${1 + Math.sin(frame * 0.05) * 0.1})`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.04em",
          }}
        >
          {brandName}
        </span>
        <div
          style={{
            width: lineWidth,
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #c8951a, transparent)",
            borderRadius: 2,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 200,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 2: Pillar Reveal (3-10s, each pillar ~2.3s) ────────────
function ScenePillarReveal({
  pillar,
  description,
  color,
  index,
}: {
  pillar: string
  description: string
  color: string
  index: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const entrance = spring({ frame, fps, config: { damping: 14 } })
  const textOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  })
  const descOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  })
  const descY = interpolate(frame, [20, 40], [20, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  })

  // Slight parallax/position based on pillar index
  const positions = [
    { x: -300, align: "flex-start" as const },
    { x: 0, align: "center" as const },
    { x: 300, align: "flex-end" as const },
  ]
  const pos = positions[index % 3]

  return (
    <AbsoluteFill
      style={{
        background: "#09090b",
        justifyContent: "center",
        alignItems: pos.align,
        padding: "0 120px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Big glow behind */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}30 0%, transparent 60%)`,
          filter: "blur(100px)",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${entrance})`,
        }}
      />

      {/* Number */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 100,
          fontSize: 220,
          fontWeight: 900,
          color: `${color}12`,
          lineHeight: 1,
        }}
      >
        0{index + 1}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 700,
          transform: `scale(${entrance})`,
        }}
      >
        {/* Accent dot */}
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 30px ${color}88`,
            marginBottom: 20,
          }}
        />

        {/* Pillar name */}
        <h2
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            opacity: textOpacity,
          }}
        >
          {pillar}
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
            marginTop: 16,
            lineHeight: 1.5,
            opacity: descOpacity,
            transform: `translateY(${descY}px)`,
          }}
        >
          {description}
        </p>

        {/* Accent line */}
        <div
          style={{
            marginTop: 24,
            width: interpolate(frame, [15, 45], [0, 120], {
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }),
            height: 3,
            background: color,
            borderRadius: 2,
          }}
        />
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 3: All pillars together (10-12.5s) ─────────────────────
function SceneAllPillars({
  pillars,
  pillarColors,
}: {
  pillars: string[]
  pillarColors: string[]
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill
      style={{
        background: "#09090b",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Multi-glow */}
      {pillarColors.map((color, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
            filter: "blur(80px)",
            left: `${20 + i * 30}%`,
            top: "40%",
            transform: `scale(${spring({ frame, fps, delay: i * 8, config: { damping: 200 } })})`,
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          gap: 60,
          position: "relative",
          zIndex: 10,
        }}
      >
        {pillars.map((pillar, i) => {
          const s = spring({
            frame,
            fps,
            delay: i * 10,
            config: { damping: 12 },
          })
          return (
            <div
              key={pillar}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
                opacity: s,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: `2px solid ${pillarColors[i]}66`,
                  background: `${pillarColors[i]}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 40px ${pillarColors[i]}33`,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: pillarColors[i],
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.02em",
                }}
              >
                {pillar}
              </span>
            </div>
          )
        })}
      </div>

      {/* Connecting line */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "20%",
          width: interpolate(frame, [0, 30], [0, 60], {
            extrapolateRight: "clamp",
          }).toString() + "%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
      />
    </AbsoluteFill>
  )
}

// ── Scene 4: CTA / Outro (12.5-15s) ─────────────────────────────
function SceneCta({
  brandName,
  ctaText,
  pillarColors,
}: {
  brandName: string
  ctaText: string
  pillarColors: string[]
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleSpring = spring({ frame, fps, config: { damping: 14 } })
  const ctaOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  })
  const ctaY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  })
  const badgeOpacity = interpolate(frame, [35, 50], [0, 1], {
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, #1a1520 0%, #09090b 70%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Gradient bar top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${pillarColors[0]}, ${pillarColors[1]}, ${pillarColors[2]})`,
        }}
      />

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,149,26,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.04em",
            transform: `scale(${titleSpring})`,
            display: "block",
          }}
        >
          {brandName}
        </span>

        <div
          style={{
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <p
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.65)",
              textAlign: "center",
            }}
          >
            {ctaText}
          </p>

          {/* CTA button */}
          <div
            style={{
              padding: "18px 48px",
              borderRadius: 50,
              background: "#c8951a",
              boxShadow: "0 20px 60px rgba(200,149,26,0.35)",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "white",
              }}
            >
              Suscribirse ahora
            </span>
          </div>
        </div>

        <div
          style={{
            opacity: badgeOpacity,
            marginTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.1em",
            }}
          >
            $499 MXN primer ano
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Main Composition ─────────────────────────────────────────────
export const CourseTrailer: React.FC<CourseTrailerProps> = ({
  title,
  subtitle,
  pillars,
  pillarDescriptions,
  pillarColors,
  brandName,
  ctaText,
}) => {
  const { fps } = useVideoConfig()

  // Timeline: 15s = 450 frames @ 30fps
  // Scene 1: Brand intro    0-3s   (0-90)
  // Scene 2: Pillar 1       3-5.3s (90-160)
  // Scene 3: Pillar 2       5.3-7.6s (160-230)
  // Scene 4: Pillar 3       7.6-10s (230-300)
  // Scene 5: All pillars    10-12.5s (300-375)
  // Scene 6: CTA/Outro      12.5-15s (375-450)

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90} premountFor={fps}>
        <SceneBrandIntro brandName={brandName} subtitle={subtitle} />
      </Sequence>

      {pillars.map((pillar, i) => (
        <Sequence
          key={pillar}
          from={90 + i * 70}
          durationInFrames={70}
          premountFor={fps}
        >
          <ScenePillarReveal
            pillar={pillar}
            description={pillarDescriptions[i]}
            color={pillarColors[i]}
            index={i}
          />
        </Sequence>
      ))}

      <Sequence from={300} durationInFrames={75} premountFor={fps}>
        <SceneAllPillars pillars={pillars} pillarColors={pillarColors} />
      </Sequence>

      <Sequence from={375} durationInFrames={75} premountFor={fps}>
        <SceneCta
          brandName={brandName}
          ctaText={ctaText}
          pillarColors={pillarColors}
        />
      </Sequence>
    </AbsoluteFill>
  )
}
