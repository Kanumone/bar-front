import React from "react";
import { CookingGame } from "$features/cooking-game";

const containerStyles: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
};

export const CookingGameSceneWrapper: React.FC = () => {
  return (
    <div style={containerStyles}>
      <CookingGame />
    </div>
  );
};
