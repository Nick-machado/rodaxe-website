import { useEffect, useRef, memo, useCallback } from "react";

interface WavesBackgroundProps {
  numWaves?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  opacity?: number;
}

const WavesBackground = memo(({ 
  numWaves = 15, 
  amplitude = 40, 
  frequency = 0.005,
  speed = 0.006,
  opacity = 0.4
}: WavesBackgroundProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const isVisibleRef = useRef(true);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  // Função de animação otimizada com throttling
  const animateWaves = useCallback(() => {
    // Não animar se não estiver visível
    if (!isVisibleRef.current) {
      animationRef.current = requestAnimationFrame(animateWaves);
      return;
    }

    timeRef.current += speed;
    const { width, height } = dimensionsRef.current;

    // Usar um único loop para todas as ondas
    for (let i = 0; i < pathsRef.current.length; i++) {
      const path = pathsRef.current[i];
      if (!path) continue;

      // Configuração de ondas com variação para cada linha
      const waveAmplitude = amplitude + (i * 2);
      const waveFrequency = frequency + (i * 0.0001);
      const phaseShift = i * 0.3;
      const baseY = (height / (numWaves + 1)) * (i + 1);

      // Gera os pontos da onda - aumentado step de 8 para 12 para menos pontos
      let pathData = `M 0 ${baseY}`;
      for (let x = 0; x <= width; x += 12) {
        const y = baseY + Math.sin(x * waveFrequency + timeRef.current + phaseShift) * waveAmplitude;
        pathData += ` L ${x} ${y}`;
      }

      // Atualiza diretamente o atributo d (mais rápido que gsap.set)
      path.setAttribute('d', pathData);
    }

    animationRef.current = requestAnimationFrame(animateWaves);
  }, [amplitude, frequency, numWaves, speed]);

  // Intersection Observer para pausar animação quando não visível
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(svg);

    return () => observer.disconnect();
  }, []);

  // Inicialização e animação
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Atualiza dimensões
    const updateDimensions = () => {
      dimensionsRef.current = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      svg.setAttribute('viewBox', `0 0 ${dimensionsRef.current.width} ${dimensionsRef.current.height}`);
    };

    updateDimensions();

    // Fade-in inicial usando CSS transition (mais leve que GSAP)
    pathsRef.current.forEach((path, i) => {
      if (path) {
        path.style.opacity = '0';
        path.style.transition = `opacity 1.5s ease-out ${i * 0.08}s`;
        // Trigger reflow
        path.getBoundingClientRect();
        path.style.opacity = String(opacity - (i * 0.015));
      }
    });

    // Inicia a animação
    animationRef.current = requestAnimationFrame(animateWaves);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateWaves, opacity]);

  // Resize handler otimizado com debounce
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (svgRef.current) {
          dimensionsRef.current = {
            width: window.innerWidth,
            height: window.innerHeight
          };
          svgRef.current.setAttribute('viewBox', `0 0 ${dimensionsRef.current.width} ${dimensionsRef.current.height}`);
        }
      }, 100); // Debounce de 100ms
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        // Otimização: isolar o SVG para evitar repaint do resto da página
        contain: "strict",
        willChange: "auto", // Deixar o browser decidir
      }}
    >
      {[...Array(numWaves)].map((_, i) => (
        <path
          key={i}
          ref={(el) => {
            if (el) pathsRef.current[i] = el;
          }}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          // Removido style inline para melhor performance
        />
      ))}
    </svg>
  );
});

WavesBackground.displayName = "WavesBackground";

export default WavesBackground;
