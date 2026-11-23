/**
 * A deliberately coarse sketch of the world's land, for dotted maps and globes:
 * for each 6° band of latitude (78°N to 54°S), the spans of longitude that are
 * land. It's drawn by hand at the scale of a dot pattern, so small islands and
 * inland seas are missing on purpose. Antarctica is left out.
 */

const BANDS: [lat: number, spans: [number, number][]][] = [
  [78, [[-120, -62], [-60, -18], [12, 28], [55, 66], [95, 110]]],
  [72, [[-125, -70], [-58, -22], [52, 58], [68, 72], [80, 130], [140, 150]]],
  [66, [[-180, -170], [-165, -85], [-75, -62], [-54, -32], [-24, -13], [13, 180]]],
  [60, [[-165, -95], [-78, -64], [-48, -43], [5, 163]]],
  [54, [[-133, -57], [-10, 0], [6, 140], [155, 162]]],
  [48, [[-125, -53], [-5, 135], [142, 144]]],
  [42, [[-124, -70], [-9, 3], [8, 16], [19, 28], [33, 47], [53, 131], [140, 145]]],
  [36, [[-122, -76], [-9, -2], [3, 11], [12, 16], [21, 122], [126, 129], [133, 141]]],
  [30, [[-116, -81], [-10, 32], [34, 48], [50, 122], [130, 132]]],
  [24, [[-112, -98], [-17, 36], [38, 59], [67, 122]]],
  [18, [[-105, -88], [-74, -68], [-16, 39], [42, 55], [73, 85], [94, 109], [120, 122]]],
  [12, [[-90, -83], [-73, -61], [-17, 51], [75, 80], [98, 109], [122, 126]]],
  [6, [[-83, -52], [-12, 48], [80, 82], [99, 103], [115, 118], [122, 126]]],
  [0, [[-80, -50], [9, 42], [98, 104], [109, 118], [120, 125], [131, 135]]],
  [-6, [[-81, -35], [12, 39], [105, 114], [119, 123], [134, 150]]],
  [-12, [[-77, -37], [13, 40], [48, 50], [130, 137], [141, 143]]],
  [-18, [[-71, -39], [12, 37], [44, 50], [122, 146]]],
  [-24, [[-70, -43], [14, 35], [43, 48], [113, 152]]],
  [-30, [[-72, -50], [17, 31], [115, 153]]],
  [-36, [[-73, -57], [136, 150], [173, 179]]],
  [-42, [[-74, -63], [145, 148], [170, 178]]],
  [-48, [[-75, -66], [166, 169]]],
  [-54, [[-74, -64], [-61, -58]]],
];

export const LAND_NORTH = 81;
export const LAND_SOUTH = -57;

/** Whether a point is on land, at this sketch's resolution. */
export function isLand(lat: number, lon: number): boolean {
  const band = BANDS[Math.round((78 - lat) / 6)];
  if (!band || Math.abs(band[0] - lat) > 3) return false;
  return band[1].some(([from, to]) => lon >= from && lon <= to);
}

/** Land points on a regular grid, `step` degrees apart. */
export function landPoints(step: number): [lat: number, lon: number][] {
  const points: [number, number][] = [];
  for (let lat = LAND_NORTH - step / 2; lat > LAND_SOUTH; lat -= step) {
    for (let lon = -180 + step / 2; lon < 180; lon += step) if (isLand(lat, lon)) points.push([lat, lon]);
  }
  return points;
}
