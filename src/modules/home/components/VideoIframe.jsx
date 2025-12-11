/**
 * Компонент для встраивания YouTube видео
 * @param {string} videoUrl - URL YouTube видео
 * @param {string} title - Заголовок видео для accessibility
 */
export default function VideoIframe({ videoUrl, title = 'Видео вебинара' }) {
  return (
    <div className='relative w-full rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100' 
         style={{ aspectRatio: '16/9' }}>
      <iframe
        src={videoUrl}
        className='w-full h-full absolute inset-0'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
        title={title}
      />
    </div>
  )
}

