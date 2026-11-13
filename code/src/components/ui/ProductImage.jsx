import { Icon } from "./Icon.jsx";

export const ProductImage = ({ src, iconClass = "w-6 h-6 text-slate-300" }) =>
  src ? (
    <img src={src} alt="" className="h-full w-full object-cover" />
  ) : (
    <Icon name="img" className={iconClass} />
  );
