import { Composition, Still } from "remotion"
import { CourseTrailer } from "./CourseTrailer"
import { CourseThumbnail } from "./CourseThumbnail"

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="CourseTrailer"
        component={CourseTrailer}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Salud, Dinero y Amor",
          subtitle: "El minicurso que transforma tu vida en tres pilares fundamentales",
          pillars: ["Salud", "Dinero", "Amor"],
          pillarDescriptions: [
            "Transforma tu bienestar fisico y mental",
            "Construye tu libertad financiera",
            "Relaciones y conexiones que te elevan",
          ],
          pillarColors: ["#10b981", "#f59e0b", "#ec4899"],
          brandName: "ALLYN",
          ctaText: "Comienza tu transformacion",
        }}
      />
      <Still
        id="CourseThumbnail"
        component={CourseThumbnail}
        width={1280}
        height={720}
        defaultProps={{
          title: "Salud, Dinero y Amor",
          subtitle: "Minicurso completo",
          pillars: ["Salud", "Dinero", "Amor"],
          pillarColors: ["#10b981", "#f59e0b", "#ec4899"],
          brandName: "ALLYN",
        }}
      />
    </>
  )
}
