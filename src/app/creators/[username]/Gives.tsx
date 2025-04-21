import { getGivesForCreator } from "~/app/features/directory/actions";
import AboutGiveModal from "~/components/AboutGiveModal";
import SkillTag from "~/components/SkillTag";

interface GivesProps {
  address: string;
}

export default async function Gives({ address }: GivesProps) {
  let gives = await getGivesForCreator(address);
  gives = gives.slice(0, 10);

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-white base-pixel flex items-center flex-wrap gap-2 justify-between pb-1">
        Coordinape GIVE Skills
        <AboutGiveModal />
      </h3>
      {gives.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {gives.map((giveGroup, index) => (
            <SkillTag
              key={index}
              skill={giveGroup.skill || "Uncategorized"}
              type="give"
              count={giveGroup.count}
              warpcastUrl={giveGroup.gives[0]?.warpcast_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
