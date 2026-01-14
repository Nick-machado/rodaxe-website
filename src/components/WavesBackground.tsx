import { useEffect, useRef } from "react";
import gsap from "gsap";

interface WavesBackgroundProps {
  numWaves?: number;
  amplitude?: number;
  frequency?: number;
  speed?: number;
  opacity?: number;
}

const WavesBackground = ({ 
  numWaves = 15, 
  amplitude = 40, 
  frequency = 0.005,
  speed = 0.015,
  opacity = 0.4
}: WavesBackgroundProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathsRef = useRef<SVGPathElement[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Atualiza o tamanho do SVG
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Função de animação contínua
    const animateWaves = () => {
      timeRef.current += speed;

      pathsRef.current.forEach((path, i) => {
        if (!path) return;

        // Configuração de ondas com variação para cada linha
        const waveAmplitude = amplitude + (i * 2);
        const waveFrequency = frequency + (i * 0.0001);
        const phaseShift = i * 0.3;
        const baseY = (height / (numWaves + 1)) * (i + 1);

        // Gera os pontos da onda
        let pathData = `M 0 ${baseY}`;
        for (let x = 0; x <= width; x += 8) {
          const y = baseY + Math.sin(x * waveFrequency + timeRef.current + phaseShift) * waveAmplitude;
          pathData += ` L ${x} ${y}`;
        }

        // Atualiza o path usando GSAP para melhor performance
        gsap.set(path, { attr: { d: pathData } });
      });

      animationRef.current = requestAnimationFrame(animateWaves);
    };

    // Inicia a animação
    animateWaves();

    // Fade-in inicial das linhas com stagger
    gsap.from(pathsRef.current, { 
      opacity: 0, 
      duration: 1.5, 
      stagger: 0.08,
      ease: "power2.out"
    });

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [numWaves, amplitude, frequency, speed]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
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
          style={{ opacity: opacity - (i * 0.015) }}
        />
      ))}
    </svg>
  );
};

export default WavesBackground;
