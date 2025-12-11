export default function Card({ title, children, className = '' }) {
  return (
    <div className={`border border-cyan-200 rounded-2xl bg-white/90 p-6 ${className}`}>
      {title && <h2 className='text-xl font-semibold text-cyan-800 mb-3'>{title}</h2>}
      {children}
    </div>
  )
}