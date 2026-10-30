export function startScrollMotion() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (preference.matches) return () => {}

  const animations = new Set<Animation>()
  const reveals = new Map<Element, Animation>()
  const visible = new WeakSet<Element>()
  document.querySelectorAll('[data-float]').forEach((element) => {
    const entrance = element.animate([
      { opacity: 0, filter: 'blur(12px)' },
      { opacity: 1, filter: 'blur(0)' }
    ], { duration: 2200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' })
    animations.add(entrance)
    entrance.onfinish = () => animations.delete(entrance)
    animations.add(element.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-24px) rotate(1deg)' },
      { transform: 'translateY(0)' }
    ], { duration: 4500, iterations: Infinity, easing: 'ease-in-out' }))
  })
  document.querySelectorAll('[data-typewriter]').forEach((element) => {
    const animation = element.animate([
      { clipPath: 'inset(0 100% 0 0)', offset: 0 },
      { clipPath: 'inset(0 0 0 0)', offset: 0.4 },
      { clipPath: 'inset(0 0 0 0)', offset: 0.8 },
      { clipPath: 'inset(0 100% 0 0)', offset: 1 }
    ], { duration: 5000, iterations: Infinity, easing: 'steps(28, end)' })
    animations.add(animation)
    animation.onfinish = () => animations.delete(animation)
  })
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      const entering = entry.isIntersecting && entry.intersectionRatio >= 0.08
      if (!entering && !visible.has(entry.target)) return
      if (entering) visible.add(entry.target)
      else visible.delete(entry.target)
      const previous = reveals.get(entry.target)
      if (previous) {
        previous.cancel()
        animations.delete(previous)
      }
      const frames = [
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ]
      const animation = entry.target.animate(entering ? frames : [...frames].reverse(), {
        duration: entering ? 1200 : 900,
        delay: entering ? Math.min(index * 90, 270) : 0,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'backwards'
      })
      animations.add(animation)
      reveals.set(entry.target, animation)
      animation.onfinish = () => {
        animations.delete(animation)
        if (reveals.get(entry.target) === animation) reveals.delete(entry.target)
      }
    })
  }, { threshold: 0.08 })

  function stop() {
    observer.disconnect()
    animations.forEach(animation => animation.cancel())
    animations.clear()
    reveals.clear()
    preference.removeEventListener('change', stop)
  }

  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element))
  preference.addEventListener('change', stop, { once: true })
  return stop
}
