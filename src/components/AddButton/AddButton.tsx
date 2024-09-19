import React, { useState } from "react";

interface AddButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  showPlus?: boolean;
  className?: string;
}

const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  children,
  showPlus = true,
  className = "",
}) => {
  const [animate, setAnimate] = useState<boolean>(false);

  const onClickHandle = () => {
    if (onClick) {
      onClick();
    }
    setAnimate(true);
  };

  return (
    <button
      onAnimationEnd={() => setAnimate(false)}
      onClick={onClickHandle}
      className={`${
        animate && "animate-wiggle"
      } relative flex h-[2.125rem] w-fit min-w-fit items-center justify-center overflow-hidden rounded-md bg-[#1f1d1a] px-[.6125rem] py-[.5625rem] font-['Inter'] text-sm font-medium leading-none text-white shadow-md shadow-[#1f1d1a]/20 ${className}`}
    >
      {showPlus ? "+" : null} {children ? children : "Add New"}
    </button>
  );
};

export default AddButton;
