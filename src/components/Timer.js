import { useEffect } from "react";

function Timer({ dispatch, secondsRemaining }) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  useEffect(
    function () {
      const id = setInterval(() => dispatch({ type: "tick" }), 1000); // Roda a função que for passada depois de certo tempo (dado em milissegundos)

      return () => clearInterval(id); // Cleanup function para matar o setInterval. Precisa do id do setInterval como argumento
    },
    [dispatch]
  );
  return (
    <div className="timer">
      {mins < 10 && "0"}
      {mins}:{secs < 10 && "0"}
      {secs}
    </div>
  );
}

export default Timer;
