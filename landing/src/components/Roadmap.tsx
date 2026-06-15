import { roadmapItems, statusConfig, type RoadmapStatus } from '../data/roadmapData';

const statusOrder: RoadmapStatus[] = ['in-progress', 'planned', 'done'];

export function Roadmap() {
  return (
    <section id="roadmap" aria-label="Dota 2 Announcer Roadmap" className="py-20 px-4 bg-dota-dark">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Dota 2 Announcer <span className="text-dota-gold">Roadmap</span>
        </h2>
        <p className="text-dota-grey mb-12 leading-relaxed max-w-2xl mx-auto text-center">
          Upcoming game timer features, voice alert improvements, and Game State Integration
          enhancements — built by the community, for the community.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const items = roadmapItems.filter((item) => item.status === status);
            return (
              <div key={status} className="flex flex-col">
                <h3 className={`text-xl font-bold mb-4 ${config.color}`}>
                  {config.label}
                  <span className="text-sm font-normal text-dota-grey ml-2">({items.length})</span>
                </h3>
                <ul className="space-y-4 flex-1" role="list">
                  {items.map((item) => (
                    <li
                      key={item.title}
                      className="p-4 rounded-lg border border-dota-grey/20 bg-dota-black/50"
                    >
                      <span className="block font-semibold text-white mb-1">{item.title}</span>
                      <span className="block text-sm text-dota-grey">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
