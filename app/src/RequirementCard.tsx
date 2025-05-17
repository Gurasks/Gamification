import './App.css'

interface Props {
  title: string;
  description: string;
  color: keyof typeof cardStyles.colors;
}

const RequirementCard = ({ title, description, color }: Props) => {
  return (
    <div className={`${cardStyles.base} ${cardStyles.colors[color]}`}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const cardStyles = {
  base: "rounded-2xl border p-4 w-40 h-24 flex items-center justify-center m-2",
  colors: {
    blue: "border-blue-500 bg-blue-500",
    yellow: "border-yellow-400 bg-yellow-400",
    purple: "border-purple-500 bg-purple-500",
  },
};

export default RequirementCard;