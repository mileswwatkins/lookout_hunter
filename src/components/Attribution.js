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
        Logo and favicon based on{" "}
        <a
          href="https://thenounproject.com/icon/watchtower-1247287/"
          rel="noreferrer"
          target="_blank"
        >
          work by Creative Mania
        </a>
      </span>
      <span className="Attribution">
        <a
          href="https://thenounproject.com/icon/external-3776998/"
          rel="noreferrer"
          target="_blank"
        >
          Link icon
        </a>{" "}
        by Adrien Coquet
      </span>
      {/*
        Colors c/o Kevin Blake
        https://github.com/kevinsblake/NatParksPalettes
      */}
    </div>
  );
};

export default Attribution;
