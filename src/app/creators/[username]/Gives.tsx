import { getGivesForCreator } from "~/app/features/directory/actions";

interface GivesProps {
  address: string;
}

export default async function Gives({ address }: GivesProps) {
  let gives = await getGivesForCreator(address);
  gives = gives.slice(0, 10);

  if (!gives.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-white base-pixel">
        Coordinape GIVE Skills
      </h3>
      <div className="flex flex-wrap gap-2">
        {gives.map((giveGroup, index) => (
          <div
            key={index}
            className="inline-flex items-center bg-white/10 hover:bg-white/15 rounded-full px-3 py-1 text-sm"
          >
            {giveGroup.skill ? (
              <a
                href={`https://coordinape.com/give/skill/${giveGroup.skill.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white"
              >
                {giveGroup.skill}
              </a>
            ) : (
              <span className="text-white/90">Uncategorized</span>
            )}
            <span className="ml-2 text-white/60 text-xs">
              {giveGroup.count}
            </span>
            {giveGroup.gives[0]?.warpcast_url && (
              <a
                href={giveGroup.gives[0].warpcast_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-300 hover:text-blue-200"
              >
                ↗
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
