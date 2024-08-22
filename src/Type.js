import React from "react";
import Typewriter from "typewriter-effect";

function Type() {
  return (
    <Typewriter
      options={{
        strings: [
          "1 AND 30 CHANGE OF WINNING!",
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
