// Building definitions and icons - collocated structure
export * from './types'
export { BuildingIcon } from './building-icon'
export { IconBase, colors } from './icon-base'

// Re-export all building modules
export * as carousel from './carousel'
export * as ferrisWheel from './ferris-wheel'
export * as rollerCoaster from './roller-coaster'
export * as bumperCars from './bumper-cars'
export * as dropTower from './drop-tower'
export * as pendulumFury from './pendulum-fury'
export * as rapidsRun from './rapids-run'

export * as foodStand from './food-stand'
export * as iceCream from './ice-cream'
export * as pizzaParlor from './pizza-parlor'
export * as drinkStand from './drink-stand'

export * as restroom from './restroom'
export * as firstAid from './first-aid'
export * as infoBooth from './info-booth'
export * as trashCan from './trash-can'
export * as cleaningCart from './cleaning-cart'
export * as janitorQuarters from './janitor-quarters'
export * as recyclingCenter from './recycling-center'

export * as fountain from './fountain'
export * as garden from './garden'
export * as bench from './bench'

export * as campground from './campground'
export * as starlightMotel from './starlight-motel'
export * as pinewoodCabins from './pinewood-cabins'
export * as parkviewInn from './parkview-inn'
export * as lakesideResort from './lakeside-resort'
export * as cloudNineSuites from './cloud-nine-suites'

export * as giftShop from './gift-shop'
export * as carnivalGames from './carnival-games'
export * as plushStand from './plush-stand'
export * as arcade from './arcade'

// Build the icons map from all modules
import * as carousel from './carousel'
import * as ferrisWheel from './ferris-wheel'
import * as rollerCoaster from './roller-coaster'
import * as bumperCars from './bumper-cars'
import * as dropTower from './drop-tower'
import * as pendulumFury from './pendulum-fury'
import * as rapidsRun from './rapids-run'
import * as foodStand from './food-stand'
import * as iceCream from './ice-cream'
import * as pizzaParlor from './pizza-parlor'
import * as drinkStand from './drink-stand'
import * as restroom from './restroom'
import * as firstAid from './first-aid'
import * as infoBooth from './info-booth'
import * as trashCan from './trash-can'
import * as cleaningCart from './cleaning-cart'
import * as janitorQuarters from './janitor-quarters'
import * as recyclingCenter from './recycling-center'
import * as fountain from './fountain'
import * as garden from './garden'
import * as bench from './bench'
import * as campground from './campground'
import * as starlightMotel from './starlight-motel'
import * as pinewoodCabins from './pinewood-cabins'
import * as parkviewInn from './parkview-inn'
import * as lakesideResort from './lakeside-resort'
import * as cloudNineSuites from './cloud-nine-suites'
import * as giftShop from './gift-shop'
import * as carnivalGames from './carnival-games'
import * as plushStand from './plush-stand'
import * as arcade from './arcade'

import type { BuildingIcon as BuildingIconType, LodgingBuildingDef, ShopBuildingDef, BuildingDef } from './types'

// Map of building ID to icon component
export const buildingIcons: Record<string, BuildingIconType> = {
  carousel: carousel.Icon,
  ferris_wheel: ferrisWheel.Icon,
  roller_coaster: rollerCoaster.Icon,
  bumper_cars: bumperCars.Icon,
  drop_tower: dropTower.Icon,
  pendulum_fury: pendulumFury.Icon,
  rapids_run: rapidsRun.Icon,
  food_stand: foodStand.Icon,
  ice_cream: iceCream.Icon,
  pizza_parlor: pizzaParlor.Icon,
  drink_stand: drinkStand.Icon,
  restroom: restroom.Icon,
  first_aid: firstAid.Icon,
  info_booth: infoBooth.Icon,
  trash_can: trashCan.Icon,
  cleaning_cart: cleaningCart.Icon,
  janitor_quarters: janitorQuarters.Icon,
  recycling_center: recyclingCenter.Icon,
  fountain: fountain.Icon,
  garden: garden.Icon,
  bench: bench.Icon,
  campground: campground.Icon,
  starlight_motel: starlightMotel.Icon,
  pinewood_cabins: pinewoodCabins.Icon,
  parkview_inn: parkviewInn.Icon,
  lakeside_resort: lakesideResort.Icon,
  cloud_nine_suites: cloudNineSuites.Icon,
  gift_shop: giftShop.Icon,
  carnival_games: carnivalGames.Icon,
  plush_stand: plushStand.Icon,
  arcade: arcade.Icon,
}

// All building definitions
export const buildings = {
  CAROUSEL: carousel.definition,
  FERRIS_WHEEL: ferrisWheel.definition,
  ROLLER_COASTER: rollerCoaster.definition,
  BUMPER_CARS: bumperCars.definition,
  DROP_TOWER: dropTower.definition,
  PENDULUM_FURY: pendulumFury.definition,
  RAPIDS_RUN: rapidsRun.definition,
  FOOD_STAND: foodStand.definition,
  ICE_CREAM: iceCream.definition,
  PIZZA_PARLOR: pizzaParlor.definition,
  DRINK_STAND: drinkStand.definition,
  RESTROOM: restroom.definition,
  FIRST_AID: firstAid.definition,
  INFO_BOOTH: infoBooth.definition,
  TRASH_CAN: trashCan.definition,
  CLEANING_CART: cleaningCart.definition,
  JANITOR_QUARTERS: janitorQuarters.definition,
  RECYCLING_CENTER: recyclingCenter.definition,
  FOUNTAIN: fountain.definition,
  GARDEN: garden.definition,
  BENCH: bench.definition,
  CAMPGROUND: campground.definition as LodgingBuildingDef,
  STARLIGHT_MOTEL: starlightMotel.definition as LodgingBuildingDef,
  PINEWOOD_CABINS: pinewoodCabins.definition as LodgingBuildingDef,
  PARKVIEW_INN: parkviewInn.definition as LodgingBuildingDef,
  LAKESIDE_RESORT: lakesideResort.definition as LodgingBuildingDef,
  CLOUD_NINE_SUITES: cloudNineSuites.definition as LodgingBuildingDef,
  GIFT_SHOP: giftShop.definition as ShopBuildingDef,
  CARNIVAL_GAMES: carnivalGames.definition as ShopBuildingDef,
  PLUSH_STAND: plushStand.definition as ShopBuildingDef,
  ARCADE: arcade.definition as ShopBuildingDef,
}

// Flat array of all buildings
export const ALL_BUILDINGS: BuildingDef[] = Object.values(buildings)

// Lodging buildings array
export const LODGING_BUILDINGS: LodgingBuildingDef[] = [
  buildings.CAMPGROUND,
  buildings.STARLIGHT_MOTEL,
  buildings.PINEWOOD_CABINS,
  buildings.PARKVIEW_INN,
  buildings.LAKESIDE_RESORT,
  buildings.CLOUD_NINE_SUITES,
]

// Shop buildings array
export const SHOP_BUILDINGS: ShopBuildingDef[] = [
  buildings.GIFT_SHOP,
  buildings.CARNIVAL_GAMES,
  buildings.PLUSH_STAND,
  buildings.ARCADE,
]

// Get icon by building ID
export function getBuildingIcon(buildingId: string): BuildingIconType | undefined {
  return buildingIcons[buildingId]
}
