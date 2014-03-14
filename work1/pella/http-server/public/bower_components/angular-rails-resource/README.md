# AngularJS Rails Resource
[![Build Status](https://travis-ci.org/FineLinePrototyping/angularjs-rails-resource.png)](https://travis-ci.org/FineLinePrototyping/angularjs-rails-resource)

A resource factory inspired by $resource from AngularJS and [Misko's recommendation](http://stackoverflow.com/questions/11850025/recommended-way-of-getting-data-from-the-server).

When starting out with AngularJS and Rails we initially were using $resource but there were three things we didn't like that this gem sets out to provide:

 1.  $resource didn't return promises
 2.  Rails prefers JSON be root wrapped
 3.  Our JSON contained snake case (underscored) keys coming from our database but we didn't want to mix snake case and camel case in our UI

In case you are unfamiliar, the intent of the resource is to behave a bit like a remote model object.  One of the nice things about AngularJS
 is that it does not require you to create specific models for all of your data which gives you a lot of freedom for treating model data as basic
 javascript objects.  However, on the Rails side when exposing models to a javascript application you are likely going to follow the same pattern for multiple
 models where you will have a controller that has your basic index (query), get, create, update, delete functionality.

The resource object created by this factory simplifies access to those models by exposing a mix of "class" methods (query, get) and
 "instance" methods (create, update, delete/remove).

This module is being used for applications we are writing and we expect that over time that we will be adding additional functionality but we welcome contributions and suggestions.

## Changes
Make sure to check the [CHANGELOG](CHANGELOG.md) for any breaking changes between releases.

## Installation

Add this line to your application's Gemfile:
```ruby
gem 'angularjs-rails-resource', '~> 0.2.0'
```
Include the javascript somewhere in your asset pipeline:
```javascript
//= require angularjs/rails/resource
```

## Dependencies
Since this is an [AngularJS](http://angularjs.org) module it of course depends on that but more specifically the it depends on the following AngularJS services:

* [$http](http://docs.angularjs.org/api/ng.$http)
* [$q](http://docs.angularjs.org/api/ng.$q)
* [$injector](http://docs.angularjs.org/api/AUTO.$injector)
* [$interpolate](http://docs.angularjs.org/api/ng.$interpolate)

## Usage
There are a lot of different ways that you can use the resources and we try not to force you into any specific pattern

There are more examples available in [EXAMPLES.md](EXAMPLES.md). We also published a complete working example (including the rails side)
at [Employee Training Tracker](https://github.com/FineLinePrototyping/employee-training-tracker) application.


### Basic Example
In order to create a Book resource, we would first define the factory within a module.
```javascript
angular.module('book.services', ['rails']);
angular.module('book.services').factory('Book', ['railsResourceFactory', function (railsResourceFactory) {
    return railsResourceFactory({url: '/books', name: 'book'});
}]);
```
We would then inject that service into a controller:
```javascript
angular.module('book.controllers').controller('BookShelfCtrl', ['$scope', 'Book', function ($scope, Book) {
    $scope.searching = true;
    // Find all books matching the title
    $scope.books = Book.query({title: title});
    $scope.books.then(function(results) {
        $scope.searching = false;
    }, function (error) {
        $scope.searching = false;
    });

    // Find a single book and update it
    Book.get(1234).then(function (book) {
        book.lastViewed = new Date();
        book.update();
    });

    // Create a book and save it
    new Book({title: 'Gardens of the Moon', author: 'Steven Erikson', isbn: '0-553-81957-7'}).create();
}]);
```
### Serializer
When defining a resource, you can pass a custom [serializer](#serializers) using the <code>serializer</code> configuration option.
```javascript
Author = railsResourceFactory({
    url: '/authors',
    name: 'author',
    serializer: railsSerializer(function () {
        this.exclude('birthDate', 'books');
        this.nestedAttribute('books');
        this.resource('books', 'Book');
    })
});
```
You can also specify a serializer as a factory and inject it as a dependency.
```javascript
angular.module('rails').factory('BookSerializer', function(railsSerializer) {
    return railsSerializer(function () {
        this.exclude('publicationDate', 'relatedBooks');
        this.rename('ISBN', 'isbn');
        this.nestedAttribute('chapters', 'notes');
        this.serializeWith('chapters', 'ChapterSerializer');
        this.add('numChapters', function (book) {
            return book.chapters.length;
        });
    });
});

Book = railsResourceFactory({
    url: '/books',
    name: 'book',
    serializer: 'BookSerializer'
});

```
## Resource Creation
Creating a resource using this factory is similar to using $resource, you just call <code>railsResourceFactory</code> with the config options and it returns a new resource function.
The resource function serves two purposes.  First is that you can use (or define new) "class" methods directly accessible such as query and get to retrieve
instances from the backend rails service.  The second is that it allows you to use it as a constructor to create new instances of that resource giving you access
to create, update, and delete instance methods (or any others you add).


### Config Options
The following options are available for the config object passed to the factory function.

 * **url** - This is the url of the service.  See [Resource URLs](#resource-urls) below for more information.
 * **enableRootWrapping** - (Default: true) Turns on/off root wrapping on JSON (de)serialization.
 * **name** - This is the name used for root wrapping when dealing with singular instances.
 * **pluralName** *(optional)* - If specified this name will be used for unwrapping array results.  If not specified then the serializer's [pluralize](#serializers) method is used to calculate
        the plural name from the singular name.
 * **httpConfig** *(optional)* - By default we will add the following headers to ensure that the request is processed as JSON by Rails. You can specify additional http config options or override any of the defaults by setting this property.  See the [AngularJS $http API](http://docs.angularjs.org/api/ng.$http) for more information.
     * **headers**
         * **Accept** - application/json
         * **Content-Type** - application/json
 * **defaultParams** *(optional)* - If the resource expects a default set of query params on every call you can specify them here.
 * **updateMethod** *(optional)* - Allows overriding the default HTTP method (PUT) used for update.  Valid values are "post", "put", or "patch".
 * **requestTransformers** *(optional) - See [Transformers / Interceptors](#transformers--interceptors)
 * **responseInterceptors** *(optional)* - See [Transformers / Interceptors](#transformers--interceptors)
 * **afterResponseInterceptors** *(optional)* - See [Transformers / Interceptors](#transformers--interceptors)

**NOTE:** The names should be specified using camel case when using the key transformations because that happens before the root wrapping by default.
For example, you should specify "publishingCompany" and "publishingCompanies" instead of "publishing_company" and "publishing_companies".

### Provider Configuration
<code>railsResourceFactory</code> can be injected as <code>railsResourceFactoryProvider</code> into your app's config method to configure defaults for all the resources application-wide.
The individual resource configuration takes precedence over application-wide default configuration values.
Each configuration option listed is exposed as a method on the provider that takes the configuration value as the parameter and returns the provider to allow method chaining.

* enableRootWrapping - {function(boolean):railsSerializerProvider}
* httpConfig - {function(object):railsSerializerProvider}
* defaultParams - {function(object):railsSerializerProvider}
* updateMethod - {function(boolean):railsSerializerProvider}

For example, to turn off the root wrapping application-wide and set the update method to PATCH:

````javascript
app.config(function (railsResourceFactoryProvider) {
    railsResourceFactoryProvider.enableRootWrapping(false).updateMethod('patch');
);
````

## Resource URLs
The URL can be specified as one of three ways:

 1. function (context) - You can pass your own custom function that converts a context variable into a url string

 2. basic string - A string without any expression variables will be treated as a base URL and assumed that instance requests should append id to the end.

 3. AngularJS expression - An expression url is evaluated at run time based on the given context for non-instance methods or the instance itself. For example, given the url expression: /stores/{{storeId}}/items/{{id}}

```javascript
Item.query({category: 'Software'}, {storeId: 123}) // would generate a GET to /stores/1234/items?category=Software
Item.get({storeId: 123, id: 1}) // would generate a GET to /stores/123/items/1

new Item({store: 123}).create() // would generate a POST to /stores/123/items
new Item({id: 1, storeId: 123}).update() // would generate a PUT to /stores/123/items/1
```

## Promises
[$http documentation](http://docs.angularjs.org/api/ng.$http) describes the promise data very well so I highly recommend reading that.

In addition to the fields listed in the $http documentation an additional field named originalData is added to the response
object to keep track of what the field was originally pointing to.  The originalData is not a deep copy, it just ensures
that if response.data is reassigned that there's still a pointer to the original response.data object.


## Resource Methods
Resources created using <code>railsResourceFactory</code> have the following class and instance methods available.

### Class Methods
* Constructor(data) - The Resource object can act as a constructor function for use with the JavaScript <code>new</code> keyword.
    * **data** {object} (optional) - Optional data to set on the new instance

* $url(context, path) - Returns the resource URL using the given context with the optional path appended if provided.
    * **context** {*} - The context to use when building the url.  See [Resource URLs](#resource-urls) above for more information.
    * **path** {string} (optional) - A path to append to the resource's URL.
    * **returns** {string} - The resource URL

* query(queryParams, context) - Executes a GET request against the resource's base url (e.g. /books).
    * **query params** {object} (optional) - An map of strings or objects that are passed to $http to be turned into query parameters
    * **context** {*} (optional) - A context object that is used during url evaluation to resolve expression variables
    * **returns** {promise} - A promise that will be resolved with an array of new Resource instances

* get(context) - Executes a GET request against the resource's url (e.g. /books/1234).
    * **context** {*} - A context object that is used during url evaluation to resolve expression variables.  If you are using a basic url this can be an id number to append to the url.
    * **returns** {promise} A promise that will be resolved with a new instance of the Resource

* $get(customUrl, queryParams) - Executes a GET request against the given URL.
    * **customUrl** {string} - The url to GET
    * **queryParams** {object} (optional) - The set of query parameters to include in the GET request
    * **returns** {promise} A promise that will be resolved with a new Resource instance (or instances in the case of an array response).

* $post(customUrl, data), $put(customUrl, data), $patch(customUrl, data) - Serializes the data parameter using the Resource's normal serialization process and submits the result as a POST / PUT / PATCH to the given URL.
    * **customUrl** {string} - The url to POST / PUT / PATCH to
    * **data** {object} - The data to serialize and POST / PUT / PATCH
    * **returns** {promise} A promise that will be resolved with a new Resource instance (or instances in the case of an array response).

* $delete(customUrl) - Executes a DELETE to a custom URL.  The main difference between this and $http.delete is that a server response that contains a body will be deserialized using the normal Resource deserialization process.
    * **customUrl** {string} - The url to DELETE to
    * **returns** {promise} A promise that will be resolved with a new Resource instance (or instances in the case of an array response) if the server includes a response body.

* beforeRequest(fn(data, resource)) - See [Transformers](#transformers) for more information.  The function is called prior to the serialization process so the data
passed to the function is still a Resource instance as long as another transformation function has not returned a new object to serialize.
    * fn(data, resource) {function} - The function to add as a transformer.
        * **data** {object} - The data being serialized
        * **resource** {Resource class} - The Resource class that is calling the function
        * **returns** {object | undefined} - If the function returns a new object that object will instead be used for serialization.

* beforeResponse(fn(data, resource, context)) - See [Interceptors](#interceptors) for more information.  The function is called after the response data has been deserialized.
    * fn(data, resource, context) {function} - The function to add as an interceptor
        * **data** {object} - The data received from the server
        * **resource** {Resource function} - The Resource constructor that is calling the function
        * **context** {Resource|undefined} - The Resource instance that is calling the function or undefined if called from a class level method (get, query).

* afterResponse(fn(data, resource, context)) - See [Interceptors](#interceptors) for more information.  This function is called after all internal processing and beforeResponse callbacks have been completed.
    * fn(data, resource) {function} - The function to add as an interceptor
        * **data** {object} - The result, either an array of resource instances or a single resource instance.
        * **resource** {Resource function} - The Resource constructor that is calling the function

### Instance Methods
The instance methods can be used on any instance (created manually or returned in a promise response) of a resource.
All of the instance methods will update the instance in-place on response and will resolve the promise with the current instance.

* $url(path) - Returns this Resource instance's URL with the optional path appended if provided.
    * **path** {string} (optional) - A path to append to the resource's URL.

* create() - Submits the resource instance to the resource's base URL (e.g. /books) using a POST
    * **returns** {promise} - A promise that will be resolved with the instance itself

* update() - Submits the resource instance to the resource's URL (e.g. /books/1234) using a PUT
    * **returns** {promise} - A promise that will be resolved with the instance itself

* save() - Calls <code>create</code> if <code>isNew</code> returns true, otherwise it calls <code>update</code>.

* remove(), delete() - Executes an HTTP DELETE against the resource's URL (e.g. /books/1234)
    * **returns** {promise} - A promise that will be resolved with the instance itself

* $post(customUrl), $put(customUrl), $patch(customUrl) - Serializes and submits the instance using an HTTP POST/PUT/PATCH to the given URL.
    * **customUrl** {string} - The url to POST / PUT / PATCH to
    * **returns** {promise} - A promise that will be resolved with the instance itself

* $delete(customUrl) - Executes a DELETE to a custom URL.  The main difference between this and $http.delete is that a server response that contains a body will be deserialized using the normal Resource deserialization process.
    * **customUrl** {string} - The url to DELETE to
    * **returns** {promise} - A promise that will be resolved with the instance itself


## Serializers
Out of the box, resources serialize all available keys and transform key names between camel case and underscores to match Ruby conventions.
However, that basic serialization often isn't ideal in every situation.  With the serializers users can define customizations
that dictate how serialization and deserialization is performed.  Users can: rename attributes, specify extra attributes, exclude attributes
with the ability to exclude all attributes by default and only serialize ones explicitly allowed, specify other serializers to use
for an attribute and even specify that an attribute is a nested resource.

AngularJS automatically excludes all attribute keys that begin with $ in their toJson code.

### railsSerializer
* railsSerializer(options, customizer) - Builds a Serializer constructor function using the configuration options specified.
    * **options** {object} (optional) - Configuration options to alter the default operation of the serializers.  This parameter can be excluded and the
    customizer function specified as the first argument instead.
    * **customizer** {function} (optional) - A function that will be called to customize the serialization logic.
    * **returns** {Serializer} - A Serializer constructor function

### Configuration
The <code>railsSerializer</code> function takes a customizer function that is called on create within the context of the constructed Serializer.
From within the customizer function you can call customization functions that affect what gets serialized and how or override the default options.

#### Configuration Options
Serializers have the following available configuration options:
* underscore - (function) Allows users to supply their own custom underscore conversion logic.
    * **default**: RailsInflector.underscore
    * parameters
        * **attribute** {string} - The current name of the attribute
    * **returns** {string} - The name as it should appear in the JSON
* camelize - (function) Allows users to supply their own custom camelization logic.
    * **default**: RailsInflector.camelize
    * parameters
        * **attribute** {string} - The name as it appeared in the JSON
    * **returns** {string} - The name as it should appear in the resource
* pluralize - (function) Allows users to supply their own custom pluralization logic.
    * default: RailsInflector.pluralize
    * parameters
        * **attribute** {string} - The name as it appeared in the JSON
    * **returns** {string} - The name as it should appear in the resource
* exclusionMatchers {array} - An list of rules that should be applied to determine whether or not an attribute should be excluded.  The values in the array can be one of the following types:
    * string - Defines a prefix that is used to test for exclusion
    * RegExp - A custom regular expression that is tested against the attribute name
    * function - A custom function that accepts a string argument and returns a boolean with true indicating exclusion.

#### Provider Configuration
<code>railsSerializer</code> can be injected as <code>railsSerializerProvider</code> into your app's config method to configure defaults for all the serializers application-wide.
Each configuration option listed is exposed as a method on the provider that takes the configuration value as the parameter and returns the provider to allow method chaining.

* underscore - {function(fn):railsSerializerProvider}
* camelize - {function(fn):railsSerializerProvider}
* pluralize - {function(fn):railsSerializerProvider}
* exclusionMatchers - {function(matchers):railsSerializerProvider}

For example, to turn off the key renaming from underscore to camel case and vice versa you would do:

````javascript
app.config(function (railsSerializerProvider) {
    railsSerializerProvider.underscore(function (value) { return value; })
        .camelize(function (value) { return value; });
);
````

#### Customization API
The customizer function passed to the railsSerializer has available to it the following methods for altering the serialization of an object.  None of these methods support nested attribute names (e.g. <code>'books.publicationDate'</code>), in order to customize the serialization of the <code>books</code> objects you would need to specify a custom serializer for the <code>books</code> attribute.

* exclude (attributeName...) - Accepts a variable list of attribute names to exclude from JSON serialization.  This has no impact on what is deserialized from the server.

* only (attributeName...) - Accepts a variable list of attribute names that should be included in JSON serialization.  This has no impact on what is deserialized from the server.  Using this method will by default exclude all other attributes and only the ones explicitly included using <code>only</code> will be serialized.

* rename (javascriptName, jsonName) - Specifies a custom name mapping for an attribute.  On serializing to JSON the <code>jsonName</code> will be used.  On deserialization, if <code>jsonName</code> is seen then it will be renamed as javascriptName in the resulting resource.  Right now it is still passed to underscore so you could do 'publicationDate' -> 'releaseDate' and it will still underscore as release_date.  However, that may be changed to prevent underscore from breaking some custom name that it doesn't handle properly.

* nestedAttribute (attributeName...) - This is a shortcut for rename that allows you to specify a variable number of attributes that should all be renamed to <code><name>_attributes</code> to work with the Rails nested_attributes feature.  This does not perform any additional logic to accomodate specifying the <code>_destroy</code> property.

* resource (attributeName, resource, serializer) - Specifies an attribute that is a nested resource within the parent object.  Nested resources do not imply nested attributes, if you want both you still have to specify call <code>nestedAttribute</code> as well.  A nested resource serves two purposes.  First, it defines the resource that should be used when constructing resources from the server.  Second, it specifies how the nested object should be serialized.  An optional third parameter <code>serializer</code> is available to override the serialization logic of the resource in case you need to serialize it differently in multiple contexts.

* add (attributeName, value) - Allows custom attribute creation as part of the serialization to JSON.  The parameter <code>value</code> can be defined as function that takes a parameter of the containing object and returns a value that should be included in the JSON.

* serializeWith (attributeName, serializer) - Specifies a custom serializer that should be used for the attribute.  The serializer can be specified either as a <code>string</code> reference to a registered service or as a Serializer constructor returned from <code>railsSerializer</code>

### Serializer Methods
The serializers are defined using mostly instance prototype methods.  For information on those methods please see the inline documentation.  There are however a couple of class methods that
are also defined to expose underscore, camelize, and pluralize.  Those functions are set to the value specified by the configuration options sent to the serializer.


## Transformers / Interceptors
The transformers and interceptors can be specified using an array containing transformer/interceptor functions or strings
that can be resolved using Angular's DI.  The transformers / interceptors concept was prior to the [serializers](#serializers) but
we kept the API available because there may be use cases that can be accomplished with these but not the serializers.

### Request Transformers
Transformer functions are called to transform the data before we send it to $http for POST/PUT.

A transformer function is called with two parameters:
* data - The data that is being sent to the server
* resource - The resource class that is calling the transformer

A transformer function must return the data.  This is to allow transformers to return entirely new objects in place of the current data (such as root wrapping).

The resource also exposes a class method <code>beforeRequest(fn)</code> that accepts a function to execute and automatically wraps it as a transformer and appends it
to the list of transformers for the resource class.  The function passed to <code>beforeRequest</code> is called with the same two parameters.  One difference
is that the functions are not required to return the data, though they still can if they need to return a new object.  See [example](EXAMPLES.md#specifying-transformer).

### Response Interceptors
Interceptor functions utilize [$q promises](http://docs.angularjs.org/api/ng.$q) to process the data returned from the server.

The interceptor is called with the promise returned from $http and is expected to return a promise for chaining.  The promise passed to each
interceptor contains two additional properties:
  * **resource** - The Resource constructor function for the resource calling the interceptor
  * **context** - The Resource instance if applicable (create, update, delete) calling the interceptor

Each interceptor promise is expected to return the response or a $q.reject.  See [Promises](#promises) for more information about the promise data.

The resource also exposes a class method <code>beforeResponse(fn)</code> that accepts a function to execute and automatically wraps it as an interceptor and appends it
to the list of interceptors for the resource class.  Functions added with <code>beforeResponse</code> don't need to know anything about promises since they are automatically wrapped
as an interceptor.

### After Response Interceptors
After response interceptors are called after all processing and response interceptors have completed.  An after response interceptor is analogous to
chaining a promise after the resource method call but is instead for all methods.

The after response interceptors are called with the final processing promise and is expected to return a promise for chaining.  The promise is resolved
with the result of the operation which will be either a resource instance or an array of resource instances.  The promise passed to the interceptor
has the following additional property:
 * **resource** - The Resource constructor function for the resource calling the interceptor

The resource also exposes a class method <code>afterResponse(fn)</code> that accepts a function to execute and automatically wraps it as an interceptor and appends it
to the list of after response interceptors for the resource class.  Functions added with <code>afterResponse</code> don't need to know anything about promises since they are automatically wrapped
as an interceptor.

## Tests
The tests are written using [Jasmine](http://pivotal.github.com/jasmine/) and are run using [Karma](https://github.com/karma-runner/karma).

Running the tests should be as simple as following the [instructions](https://github.com/karma-runner/karma)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License
Copyright (c) 2012 - 2013 [FineLine Prototyping, Inc.](http://www.finelineprototyping.com)

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
