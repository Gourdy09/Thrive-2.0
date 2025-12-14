import FoodScreen from "./foodScreen";

export default function FoodContainer() {
  const recipeUrls = [
    "https://www.simplyrecipes.com/citrus-marinated-chicken-breasts-recipe-11845630",
    "https://www.nutrition.gov/recipes/oatmeal-pecan-waffles",
    "https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/",
  ];

  const username = "UserName";

  return <FoodScreen username={username} />;
}
