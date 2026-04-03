import { AbsoluteFill } from "remotion"

export type CourseThumbnailProps = {
  title: string
  subtitle: string
  pillars: string[]
  pillarColors: string[]
  brandName: string
}

export const CourseThumbnail: React.FC<CourseThumbnailProps> = ({
  title,
  subtitle,
  pillars,
  pillarColors,
  brandName,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #09090b 0%, #0c0a15 40%, #120a1a 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -60,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${pillarColors[0]}33 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -40,
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${pillarColors[2]}33 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${pillarColors[1]}22 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top accent line */}
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

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          height: "100%",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#c8951a",
            }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: "rgba(200,149,26,0.9)",
              textTransform: "uppercase" as const,
            }}
          >
            {brandName}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            maxWidth: 800,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.55)",
            marginBottom: 40,
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>

        {/* Pillar pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {pillars.map((pillar, i) => (
            <div
              key={pillar}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 40,
                border: `1px solid ${pillarColors[i]}44`,
                background: `${pillarColors[i]}15`,
                backdropFilter: "blur(8px)",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: pillarColors[i],
                  boxShadow: `0 0 20px ${pillarColors[i]}66`,
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.88)",
                }}
              >
                {pillar}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side decorative element */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
        }}
      >
        {pillarColors.map((color, i) => (
          <div
            key={i}
            style={{
              width: 60 - i * 8,
              height: 60 - i * 8,
              borderRadius: "50%",
              border: `2px solid ${color}55`,
              background: `${color}18`,
              boxShadow: `0 0 40px ${color}22`,
            }}
          />
        ))}
      </div>

      {/* "MINICURSO" badge bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 60,
          padding: "10px 28px",
          borderRadius: 30,
          background: "rgba(200,149,26,0.15)",
          border: "1px solid rgba(200,149,26,0.3)",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "rgba(200,149,26,0.9)",
            textTransform: "uppercase" as const,
          }}
        >
          Minicurso
        </span>
      </div>
    </AbsoluteFill>
  )
}
