import { getCurrentUser } from '../../../utils/userStore'
import Avatar from '../../../components/Header/Avatar'

/**
 * Карточка с рейтингом пользователей по энергии за месяц
 */
export default function LeaderboardCard({ leaderboard = [] }) {
  const currentUser = getCurrentUser()
  const currentUsername = currentUser?.username
  
  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 col-span-1 md:col-span-2 lg:col-span-3'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='text-3xl'>🏆</div>
        <div>
          <h2 className='text-xl font-bold text-gray-900'>Рейтинг за месяц</h2>
          <p className='text-sm text-gray-600'>Топ пользователей по заработанной энергии</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <p>Пока никто не заработал энергию в этом месяце</p>
          <p className='text-sm mt-2'>Будь первым! 💪</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {leaderboard.map((user, index) => {
            const isCurrentUser = user.username === currentUsername
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
            
            return (
              <div
                key={user.username}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  isCurrentUser 
                    ? 'bg-cyan-50 border-2 border-cyan-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className='flex items-center gap-4'>
                  <div className='text-lg font-bold text-gray-500 w-8 text-center'>
                    {medal || `#${index + 1}`}
                  </div>
                  
                  <div className='flex items-center gap-2'>
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      avatar={user.avatar}
                      username={user.username}
                      size='w-10 h-10'
                    />
                    
                    <div>
                      <div className='font-medium text-gray-900 flex items-center gap-2'>
                        {user.displayName || `${user.lastName} ${user.firstName}`.trim() || user.username}
                        {isCurrentUser && (
                          <span className='text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full'>
                            Вы
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className='flex items-center gap-2'>
                  <span className='text-xl font-bold text-cyan-600'>
                    {user.coins}
                  </span>
                  <span className='text-yellow-500 text-xl'>⚡</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {leaderboard.length > 0 && !leaderboard.find(u => u.username === currentUsername) && (
        <div className='mt-4 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-500 text-center'>
            Заработай энергию, чтобы попасть в топ! 🚀
          </p>
        </div>
      )}
    </div>
  )
}

