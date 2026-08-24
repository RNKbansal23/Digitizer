import { AnimatedMarqueeHero } from '@/components/ui/hero-3';

// School-themed Unsplash images (classrooms, education, kids learning)
const SCHOOL_IMAGES = [
  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
];

export default function LandingPage() {
  return (
    <AnimatedMarqueeHero
      tagline="✏️ Trusted by 500+ Indian schools"
      title={
        <>
          School Admin
          <br />
          in 10 Seconds
        </>
      }
      description="Mark attendance, snap homework, and notify parents — all before the morning bell rings. No training needed."
      ctaText="Open Teacher Dashboard →"
      ctaHref="/teacher"
      images={SCHOOL_IMAGES}
    />
  );
}