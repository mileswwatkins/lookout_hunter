import "./Attribution.css";

const Attribution = () => {
  return (
    <div>
      <span className="Attribution">
        <a
          href="https://github.com/mileswwatkins/lookout_hunter"
          rel="noreferrer"
          target="_blank"
        >
          Coded with ♥
        </a>{" "}
        by{" "}
        <a href="http://mileswwatkins.com" rel="noreferrer" target="_blank">
          Miles Watkins
        </a>
      </span>
      <span className="Attribution">
        Logo based on{" "}
        <a href="https://thenounproject.com/icon/watchtower-1247287/">
          work by Creative Mania
        </a>
      </span>
    </div>
  );
};

export default Attribution;
