$("document").ready(function () {
    var random = ["chicken", "beef", "vegetables", "fruit", "soup", "candy", "pasta", "pie", "cake"];
    var rand = random[Math.floor(Math.random() * random.length)];
    var apiKeyIndex = 0;

    function getKey() {

        $.get("/getkey", function (sentVariable) {

            var apiKey = sentVariable.key[apiKeyIndex];

            // AJAX call for ingredients using the recipe id provided in the first AJAX call
            function ingredientsAPI(recipeId, trueOrFalse, recipeResult, num) {
                $.ajax({
                    url: 'https://www.food2fork.com/api/get',
                    type: 'GET',
                    data: {
                        key: apiKey,
                        rId: recipeId,
                    },
                    success: function (result) {
                        var results = JSON.parse(result);

                        //this is so it will only go to the database if we "favorite" it
                        if (trueOrFalse) {

                            for (var i = 0; i < results.recipe.ingredients.length; i++) { }

                            // console.log(results.recipe.title);

                            results.recipe.ingredients.forEach(function (element) {
                                //this adds all ingredients to the shopping cart
                                ingredientsToCart({
                                    Ingredients: element,
                                    RecipeTableId: recipeId,
                                });
                            });

                        } else {

                            $(".carousel-inner").append(
                                `<div class="carousel-item col-md-4 active">
                                    <div class="card" style="width: 16rem; height: 25rem; background-color: rgba(255, 255, 255, 0.4); margin: 0 auto;">
                                    <img class="card-img-top img-fluid" data-img= ${recipeResult.image_url} src= ${recipeResult.image_url} alt="Card image cap" style='min-height: 12rem; max-height: 12rem; max-width: 16rem; overflow: hidden;'>
                                    <div class="card-body" style="background-color: transparent;">
                                        <h4 class="card-title" data-title='${recipeResult.title}'>${recipeResult.title}</h4>
                                        <a target='_blank' data-source=${recipeResult.source_url} href=${recipeResult.source_url} class='card-link mx-auto'>
                                             Recipe Link
                                         </a>
                                         <button type='button' data-rid=${recipeResult.recipe_id} data-img=${recipeResult.image_url} data-title='${recipeResult.title}' class='btn btn-primary btn-sm mx-auto mt-2 favSave-btn'  data-source=${recipeResult.source_url} style='display: block'>
                                             Save to Favorites
                                        </button> 
                                    </div>
                                    </div>
                                </div>`
                            );
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            }

            // First AJAX call providing recipe id, image url, title of recipe, and source url
            $.ajax({
                url: 'https://www.food2fork.com/api/search',
                type: 'GET',
                data: {
                    key: apiKey,
                    q: rand,
                    count: 3
                },
                success: function (result) {
                    var results = JSON.parse(result);
                    if (results.error == "limit") {
                        apiKeyIndex++;
                        if (apiKeyIndex >= 9){
                            alert("The Food 2 Fork API request limit has been reached for this application. Please try again tomorrow when the limit has reset, sorry for the inconvience.")
                        } else {
                            getKey();
                        }
                    } else if (apiKeyIndex >= 9){
                        alert("The Food 2 Fork API request limit has been reached for this application. Please try again tomorrow when the limit has reset, sorry for the inconvience.")
                    } else {
                        results.recipes.forEach(function (element, i) {
                            ingredientsAPI(element.recipe_id, false, results.recipes[i], i);
                        });
                    }
                },
                error: function (error) {
                    alert("The Food 2 Fork API request limit has been reached for this application. Please try again tomorrow when the limit has reset, sorry for the inconvience.")
                    console.log(error);
                }
            });
        });
    };
    getKey();
});
