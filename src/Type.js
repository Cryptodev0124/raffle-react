import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          "1 IN 30 CHANCE OF WINNING!",
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        cursor: ""
      }}
    />
  );
}

export default Type;
