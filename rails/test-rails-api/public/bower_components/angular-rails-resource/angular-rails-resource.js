/**
 * A resource factory inspired by $resource from AngularJS
 * @version v1.0.0-pre.3 - 2013-12-22
 * @link https://github.com/FineLinePrototyping/angularjs-rails-resource.git
 * @author
 */

(function (undefined) {
    angular.module('rails', ['ng']);
}());



(function (undefined) {
    angular.module('rails').factory('RailsInflector', function() {
        function camelize(key) {
            if (!angular.isString(key)) {
                return key;
            }

            // should this match more than word and digit characters?
            return key.replace(/_[\w\d]/g, function (match, index, string) {
                return index === 0 ? match : string.charAt(index + 1).toUpperCase();
            });
        }

        function underscore(key) {
            if (!angular.isString(key)) {
                return key;
            }

            // TODO match the latest logic from Active Support
            return key.replace(/[A-Z]/g, function (match, index) {
                return index === 0 ? match : '_' + match.toLowerCase();
            });
        }

        function pluralize(value) {
            // TODO match Active Support
            return value + 's';
        }

        return {
            camelize: camelize,
            underscore: underscore,
            pluralize: pluralize
        };
    });
}());
(function (undefined) {
    angular.module('rails').factory('RailsResourceInjector', ['$injector', function($injector) {
        /**
         * Allow dependencies to be referenced by name or instance.  If referenced by name AngularJS $injector
         * is used to retrieve the dependency.
         *
         * @param dependency (string | function) The dependency to retrieve
         * @returns {*} The dependency
         */
        function getDependency(dependency) {
            if (dependency) {
                return angular.isString(dependency) ? $injector.get(dependency) : dependency;
            }

            return undefined;
        }

        /**
         * Looks up and instantiates an instance of the requested service.  If the service is not a string then it is
         * assumed to be a constructor function.
         *
         * @param {String|function|Object} service  The service to instantiate
         * @returns {*} A new instance of the requested service
         */
        function createService(service) {
            if (service) {
                return $injector.instantiate(getDependency(service));
            }

            return undefined;
        }

        /**
         * Looks up and instantiates an instance of the requested service if .
         * @param {String|function|Object} service The service to instantiate
         * @returns {*}
         */
        function getService(service) {
            // strings and functions are not considered objects by angular.isObject()
            if (angular.isObject(service)) {
                return service;
            } else if (service) {
                return createService(service);
            }

            return undefined;
        }

        return {
            createService: createService,
            getService: getService,
            getDependency: getDependency
        };
    }]);
}());
/**
 * @ngdoc function
 * @name rails.railsUrlBuilder
 * @function
 * @requires $interpolate
 *
 * @description
 *
 * Compiles a URL template string into an interpolation function using $interpolate.  If no interpolation bindings
 * found then {{id}} is appended to the url string.
 *
 <pre>
 expect(railsUrlBuilder('/books')()).toEqual('/books')
 expect(railsUrlBuilder('/books')({id: 1})).toEqual('/books/1')
 expect(railsUrlBuilder('/authors/{{authorId}}/books/{{id}}')({id: 1, authorId: 2})).toEqual('/authors/2/books/1')
 </pre>
 *
 * If the $interpolate startSymbol and endSymbol have been customized those values should be used instead of {{ and }}
 *
 * @param {string|function} url If the url is a function then that function is returned.  Otherwise the url string
 *    is passed to $interpolate as an expression.
 *
 * @returns {function(context)} As stated by $interpolate documentation:
 *    An interpolation function which is used to compute the interpolated
 *    string. The function has these parameters:
 *
 *    * `context`: an object against which any expressions embedded in the strings are evaluated
 *      against.
 *
 */
(function (undefined) {
    angular.module('rails').factory('railsUrlBuilder', ['$interpolate', function($interpolate) {
        return function (url) {
            var expression;

            if (angular.isFunction(url) || angular.isUndefined(url)) {
                return url;
            }

            if (url.indexOf($interpolate.startSymbol()) === -1) {
                url = url + '/' + $interpolate.startSymbol() + 'id' + $interpolate.endSymbol();
            }

            expression = $interpolate(url);

            return function (params) {
                url = expression(params);

                if (url.charAt(url.length - 1) === '/') {
                    url = url.substr(0, url.length - 1);
                }

                return url;
            };
        };
    }]);
}());
(function (undefined) {
    angular.module('rails').provider('railsSerializer', function() {
        var defaultOptions = {
            underscore: undefined,
            camelize: undefined,
            pluralize: undefined,
            exclusionMatchers: []
        };

        /**
         * Configures the underscore method used by the serializer.  If not defined then <code>RailsInflector.underscore</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for underscore conversion
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.underscore = function(fn) {
            defaultOptions.underscore = fn;
            return this;
        };

        /**
         * Configures the camelize method used by the serializer.  If not defined then <code>RailsInflector.camelize</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for camelize conversion
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.camelize = function(fn) {
            defaultOptions.camelize = fn;
            return this;
        };

        /**
         * Configures the pluralize method used by the serializer.  If not defined then <code>RailsInflector.pluralize</code>
         * will be used.
         *
         * @param {function(string):string} fn The function to use for pluralizing strings.
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.pluralize = function(fn) {
            defaultOptions.pluralize = fn;
            return this;
        };

        /**
         * Configures the array exclusion matchers by the serializer.  Exclusion matchers can be one of the following:
         * * string - Defines a prefix that is used to test for exclusion
         * * RegExp - A custom regular expression that is tested against the attribute name
         * * function - A custom function that accepts a string argument and returns a boolean with true indicating exclusion.
         *
         * @param {Array.<string|function(string):boolean|RegExp} exclusions An array of exclusion matchers
         * @returns {railsSerializerProvider} The provider for chaining
         */
        this.exclusionMatchers = function(exclusions) {
            defaultOptions.exclusionMatchers = exclusions;
            return this;
        };

        this.$get = ['$injector', 'RailsInflector', 'RailsResourceInjector', function ($injector, RailsInflector, RailsResourceInjector) {
            defaultOptions.underscore = defaultOptions.underscore || RailsInflector.underscore;
            defaultOptions.camelize = defaultOptions.camelize || RailsInflector.camelize;
            defaultOptions.pluralize = defaultOptions.pluralize || RailsInflector.pluralize;

            function railsSerializer(options, customizer) {

                function Serializer() {
                    if (angular.isFunction(options)) {
                        customizer = options;
                        options = {};
                    }

                    this.exclusions = {};
                    this.inclusions = {};
                    this.serializeMappings = {};
                    this.deserializeMappings = {};
                    this.customSerializedAttributes = {};
                    this.preservedAttributes = {};
                    this.customSerializers = {};
                    this.nestedResources = {};
                    this.options = angular.extend({excludeByDefault: false}, defaultOptions, options || {});

                    if (customizer) {
                        customizer.call(this, this);
                    }
                }

                /**
                 * Accepts a variable list of attribute names to exclude from JSON serialization.
                 *
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.exclude = function () {
                    var exclusions = this.exclusions;

                    angular.forEach(arguments, function (attributeName) {
                        exclusions[attributeName] = false;
                    });

                    return this;
                };

                /**
                 * Accepts a variable list of attribute names that should be included in JSON serialization.
                 * Using this method will by default exclude all other attributes and only the ones explicitly included using <code>only</code> will be serialized.
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.only = function () {
                    var inclusions = this.inclusions;
                    this.options.excludeByDefault = true;

                    angular.forEach(arguments, function (attributeName) {
                        inclusions[attributeName] = true;
                    });

                    return this;
                };

                /**
                 * This is a shortcut for rename that allows you to specify a variable number of attributes that should all be renamed to
                 * <code>{attributeName}_attributes</code> to work with the Rails nested_attributes feature.
                 * @param attributeNames... {string} Variable number of attribute name parameters
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.nestedAttribute = function () {
                    var self = this;

                    angular.forEach(arguments, function (attributeName) {
                        self.rename(attributeName, attributeName + '_attributes');
                    });

                    return this;
                };

                /**
                 * Specifies an attribute that is a nested resource within the parent object.
                 * Nested resources do not imply nested attributes, if you want both you still have to specify call <code>nestedAttribute</code> as well.
                 *
                 * A nested resource serves two purposes.  First, it defines the resource that should be used when constructing resources from the server.
                 * Second, it specifies how the nested object should be serialized.
                 *
                 * An optional third parameter <code>serializer</code> is available to override the serialization logic
                 * of the resource in case you need to serialize it differently in multiple contexts.
                 *
                 * @param attributeName {string} The name of the attribute that is a nested resource
                 * @param resource {string | Resource} A reference to the resource that the attribute is a type of.
                 * @param serializer {string | Serializer} (optional) An optional serializer reference to override the nested resource's default serializer
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.resource = function (attributeName, resource, serializer) {
                    this.nestedResources[attributeName] = resource;

                    if (serializer) {
                        this.serializeWith(attributeName, serializer);
                    }

                    return this;
                };

                /**
                 * Specifies a custom name mapping for an attribute.
                 * On serializing to JSON the jsonName will be used.
                 * On deserialization, if jsonName is seen then it will be renamed as javascriptName in the resulting resource.
                 *
                 * @param javascriptName {string} The attribute name as it appears in the JavaScript object
                 * @param jsonName {string} The attribute name as it should appear in JSON
                 * @param bidirectional {boolean} (optional) Allows turning off the bidirectional renaming, defaults to true.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.rename = function (javascriptName, jsonName, bidirectional) {
                    this.serializeMappings[javascriptName] = jsonName;

                    if (bidirectional || bidirectional === undefined) {
                        this.deserializeMappings[jsonName] = javascriptName;
                    }
                    return this;
                };

                /**
                 * Allows custom attribute creation as part of the serialization to JSON.
                 *
                 * @param attributeName {string} The name of the attribute to add
                 * @param value {*} The value to add, if specified as a function then the function will be called during serialization
                 *     and should return the value to add.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.add = function (attributeName, value) {
                    this.customSerializedAttributes[attributeName] = value;
                    return this;
                };


                /**
                 * Allows the attribute to be preserved unmodified in the resulting object.
                 *
                 * @param attributeName {string} The name of the attribute to add
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.preserve = function(attributeName) {
                    this.preservedAttributes[attributeName] =  true;
                    return this;
                };

                /**
                 * Specify a custom serializer to use for an attribute.
                 *
                 * @param attributeName {string} The name of the attribute
                 * @param serializer {string | function} A reference to the custom serializer to use for the attribute.
                 * @returns {Serializer} this for chaining support
                 */
                Serializer.prototype.serializeWith = function (attributeName, serializer) {
                    this.customSerializers[attributeName] = serializer;
                    return this;
                };

                /**
                 * Determines whether or not an attribute should be excluded.
                 *
                 * If the option excludeByDefault has been set then attributes will default to excluded and will only
                 * be included if they have been included using the "only" customization function.
                 *
                 * If the option excludeByDefault has not been set then attributes must be explicitly excluded using the "exclude"
                 * customization function or must be matched by one of the exclusionMatchers.
                 *
                 * @param attributeName The name of the attribute to check for exclusion
                 * @returns {boolean} true if excluded, false otherwise
                 */
                Serializer.prototype.isExcludedFromSerialization = function (attributeName) {
                    if ((this.options.excludeByDefault && !this.inclusions.hasOwnProperty(attributeName)) || this.exclusions.hasOwnProperty(attributeName)) {
                        return true;
                    }

                    if (this.options.exclusionMatchers) {
                        var excluded = false;

                        angular.forEach(this.options.exclusionMatchers, function (matcher) {
                            if (angular.isString(matcher)) {
                                excluded = excluded || attributeName.indexOf(matcher) === 0;
                            } else if (angular.isFunction(matcher)) {
                                excluded = excluded || matcher.call(undefined, attributeName);
                            } else if (matcher instanceof RegExp) {
                                excluded = excluded || matcher.test(attributeName);
                            }
                        });

                        return excluded;
                    }

                    return false;
                };

                /**
                 * Remaps the attribute name to the serialized form which includes:
                 *   - checking for exclusion
                 *   - remapping to a custom value specified by the rename customization function
                 *   - underscoring the name
                 *
                 * @param attributeName The current attribute name
                 * @returns {*} undefined if the attribute should be excluded or the mapped attribute name
                 */
                Serializer.prototype.getSerializedAttributeName = function (attributeName) {
                    var mappedName = this.serializeMappings[attributeName] || attributeName;

                    var mappedNameExcluded = this.isExcludedFromSerialization(mappedName),
                        attributeNameExcluded = this.isExcludedFromSerialization(attributeName);

                    if(this.options.excludeByDefault) {
                        if(mappedNameExcluded && attributeNameExcluded) {
                            return undefined;
                        }
                    } else {
                        if (mappedNameExcluded || attributeNameExcluded) {
                            return undefined;
                        }
                    }

                    return this.underscore(mappedName);
                };

                /**
                 * Determines whether or not an attribute should be excluded from deserialization.
                 *
                 * By default, we do not exclude any attributes from deserialization.
                 *
                 * @param attributeName The name of the attribute to check for exclusion
                 * @returns {boolean} true if excluded, false otherwise
                 */
                Serializer.prototype.isExcludedFromDeserialization = function (attributeName) {
                    return false;
                };

                /**
                 * Remaps the attribute name to the deserialized form which includes:
                 *   - camelizing the name
                 *   - checking for exclusion
                 *   - remapping to a custom value specified by the rename customization function
                 *
                 * @param attributeName The current attribute name
                 * @returns {*} undefined if the attribute should be excluded or the mapped attribute name
                 */
                Serializer.prototype.getDeserializedAttributeName = function (attributeName) {
                    var camelizedName = this.camelize(attributeName);

                    camelizedName = this.deserializeMappings[attributeName] ||
                        this.deserializeMappings[camelizedName] ||
                        camelizedName;

                    if (this.isExcludedFromDeserialization(attributeName) || this.isExcludedFromDeserialization(camelizedName)) {
                        return undefined;
                    }

                    return camelizedName;
                };

                /**
                 * Returns a reference to the nested resource that has been specified for the attribute.
                 * @param attributeName The attribute name
                 * @returns {*} undefined if no nested resource has been specified or a reference to the nested resource class
                 */
                Serializer.prototype.getNestedResource = function (attributeName) {
                    return RailsResourceInjector.getDependency(this.nestedResources[attributeName]);
                };

                /**
                 * Returns a custom serializer for the attribute if one has been specified.  Custom serializers can be specified
                 * in one of two ways.  The serializeWith customization method allows specifying a custom serializer for any attribute.
                 * Or an attribute could have been specified as a nested resource in which case the nested resource's serializer
                 * is used.  Custom serializers specified using serializeWith take precedence over the nested resource serializer.
                 *
                 * @param attributeName The attribute name
                 * @returns {*} undefined if no custom serializer has been specified or an instance of the Serializer
                 */
                Serializer.prototype.getAttributeSerializer = function (attributeName) {
                    var resource = this.getNestedResource(attributeName),
                        serializer = this.customSerializers[attributeName];

                    // custom serializer takes precedence over resource serializer
                    if (serializer) {
                        return RailsResourceInjector.createService(serializer);
                    } else if (resource) {
                        return resource.config.serializer;
                    }

                    return undefined;
                };


                /**
                 * Prepares the data for serialization to JSON.
                 *
                 * @param data The data to prepare
                 * @returns {*} A new object or array that is ready for JSON serialization
                 */
                Serializer.prototype.serializeValue = function (data) {
                    var result = data,
                        self = this;

                    if (angular.isArray(data)) {
                        result = [];

                        angular.forEach(data, function (value) {
                            result.push(self.serializeValue(value));
                        });
                    } else if (angular.isObject(data)) {
                        if (angular.isDate(data)) {
                            return data;
                        }
                        result = {};

                        angular.forEach(data, function (value, key) {
                            // if the value is a function then it can't be serialized to JSON so we'll just skip it
                            if (!angular.isFunction(value)) {
                                self.serializeAttribute(result, key, value);
                            }
                        });
                    }

                    return result;
                };

                /**
                 * Transforms an attribute and its value and stores it on the parent data object.  The attribute will be
                 * renamed as needed and the value itself will be serialized as well.
                 *
                 * @param data The object that the attribute will be added to
                 * @param attribute The attribute to transform
                 * @param value The current value of the attribute
                 */
                Serializer.prototype.serializeAttribute = function (data, attribute, value) {
                    var serializer = this.getAttributeSerializer(attribute),
                        serializedAttributeName = this.getSerializedAttributeName(attribute);

                    // undefined means the attribute should be excluded from serialization
                    if (serializedAttributeName === undefined) {
                        return;
                    }

                    data[serializedAttributeName] = serializer ? serializer.serialize(value) : this.serializeValue(value);
                };

                /**
                 * Serializes the data by applying various transformations such as:
                 *   - Underscoring attribute names
                 *   - attribute renaming
                 *   - attribute exclusion
                 *   - custom attribute addition
                 *
                 * @param data The data to prepare
                 * @returns {*} A new object or array that is ready for JSON serialization
                 */
                Serializer.prototype.serialize = function (data) {
                    var result = this.serializeValue(data),
                        self = this;

                    if (angular.isObject(result)) {
                        angular.forEach(this.customSerializedAttributes, function (value, key) {
                            if (angular.isFunction(value)) {
                                value = value.call(data, data);
                            }

                            self.serializeAttribute(result, key, value);
                        });
                    }

                    return result;
                };

                /**
                 * Iterates over the data deserializing each entry on arrays and each key/value on objects.
                 *
                 * @param data The object to deserialize
                 * @param Resource (optional) The resource type to deserialize the result into
                 * @returns {*} A new object or an instance of Resource populated with deserialized data.
                 */
                Serializer.prototype.deserializeValue = function (data, Resource) {
                    var result = data,
                        self = this;

                    if (angular.isArray(data)) {
                        result = [];

                        angular.forEach(data, function (value) {
                            result.push(self.deserializeValue(value, Resource));
                        });
                    } else if (angular.isObject(data)) {
                        if (angular.isDate(data)) {
                            return data;
                        }

                        result = {};

                        if (Resource) {
                            result = new Resource.config.resourceConstructor();
                        }

                        angular.forEach(data, function (value, key) {
                            self.deserializeAttribute(result, key, value);
                        });
                    }

                    return result;
                };

                /**
                 * Transforms an attribute and its value and stores it on the parent data object.  The attribute will be
                 * renamed as needed and the value itself will be deserialized as well.
                 *
                 * @param data The object that the attribute will be added to
                 * @param attribute The attribute to transform
                 * @param value The current value of the attribute
                 */
                Serializer.prototype.deserializeAttribute = function (data, attribute, value) {
                    var serializer,
                        NestedResource,
                        attributeName = this.getDeserializedAttributeName(attribute);

                    // undefined means the attribute should be excluded from serialization
                    if (attributeName === undefined) {
                        return;
                    }

                    serializer = this.getAttributeSerializer(attributeName);
                    NestedResource = this.getNestedResource(attributeName);

                    // preserved attributes are assigned unmodified
                    if (this.preservedAttributes[attributeName]) {
                        data[attributeName] = value;
                    } else {
                        data[attributeName] = serializer ? serializer.deserialize(value, NestedResource) : this.deserializeValue(value, NestedResource);
                    }
                };

                /**
                 * Deserializes the data by applying various transformations such as:
                 *   - Camelizing attribute names
                 *   - attribute renaming
                 *   - attribute exclusion
                 *   - nested resource creation
                 *
                 * @param data The object to deserialize
                 * @param Resource (optional) The resource type to deserialize the result into
                 * @returns {*} A new object or an instance of Resource populated with deserialized data
                 */
                Serializer.prototype.deserialize = function (data, Resource) {
                    // just calls deserializeValue for now so we can more easily add on custom attribute logic for deserialize too
                    return this.deserializeValue(data, Resource);
                };

                Serializer.prototype.pluralize = function (value) {
                    if (this.options.pluralize) {
                        return this.options.pluralize(value);
                    }
                    return value;
                };

                Serializer.prototype.underscore = function (value) {
                    if (this.options.underscore) {
                        return this.options.underscore(value);
                    }
                    return value;
                };

                Serializer.prototype.camelize = function (value) {
                    if (this.options.camelize) {
                        return this.options.camelize(value);
                    }
                    return value;
                };

                return Serializer;
            }

            railsSerializer.defaultOptions = defaultOptions;
            return railsSerializer;
        }];
    });
}());

(function (undefined) {
    angular.module('rails').factory('railsRootWrappingTransformer', function () {
        return function (data, resource) {
            var result = {};
            result[angular.isArray(data) ? resource.config.pluralName : resource.config.name] = data;
            return result;
        };
    });

    angular.module('rails').factory('railsRootWrappingInterceptor', function () {
        return function (promise) {
            var resource = promise.resource;

            if (!resource) {
                return promise;
            }

            return promise.then(function (response) {
                if (response.data && response.data.hasOwnProperty(resource.config.name)) {
                    response.data = response.data[resource.config.name];
                } else if (response.data && response.data.hasOwnProperty(resource.config.pluralName)) {
                    response.data = response.data[resource.config.pluralName];
                }

                return response;
            });
        };
    });

    angular.module('rails').provider('RailsResource', function () {
        var defaultOptions = {
            rootWrapping: true,
            updateMethod: 'put',
            httpConfig: {},
            defaultParams: undefined,
            underscoreParams: true,
            extensions: []
        };

        /**
         * Enables or disables root wrapping by default for RailsResources
         * Defaults to true.
         * @param {boolean} value true to enable root wrapping, false to disable
         * @returns {RailsResourceProvider} The provider instance
         */
        this.rootWrapping = function (value) {
            defaultOptions.rootWrapping = value;
            return this;
        };

        /**
         * Configures what HTTP operation should be used for update by default for RailsResources.
         * Defaults to 'put'
         * @param value
         * @returns {RailsResourceProvider} The provider instance
         */
        this.updateMethod = function (value) {
            defaultOptions.updateMethod = value;
            return this;
        };

        /**
         * Configures default HTTP configuration operations for all RailsResources.
         *
         * @param {Object} value See $http for available configuration options.
         * @returns {RailsResourceProvider} The provider instance
         */
        this.httpConfig = function (value) {
            defaultOptions.httpConfig = value;
            return this;
        };

        /**
         * Configures default HTTP query parameters for all RailsResources.
         *
         * @param {Object} value Object of key/value pairs representing the HTTP query parameters for all HTTP operations.
         * @returns {RailsResourceProvider} The provider instance
         */
        this.defaultParams = function (value) {
            defaultOptions.defaultParams = value;
            return this;
        };

        /**
         * Configures whether or not underscore query parameters
         * @param {boolean} value true to underscore.  Defaults to true.
         * @returns {RailsResourceProvider} The provider instance
         */
        this.underscoreParams = function (value) {
            defaultOptions.underscoreParams = value;
            return this;
        };

        /**
         * List of RailsResource extensions to include by default.
         *
         * @param {...string} extensions One or more extension names to include
         * @returns {*}
         */
        this.extensions = function () {
            defaultOptions.extensions = [];
            angular.forEach(arguments, function (value) {
                defaultOptions.extensions = defaultOptions.extensions.concat(value);
            });
            return this;
        };

        this.$get = ['$http', '$q', 'railsUrlBuilder', 'railsSerializer', 'railsRootWrappingTransformer', 'railsRootWrappingInterceptor', 'RailsResourceInjector', 'RailsInflector',
            function ($http, $q, railsUrlBuilder, railsSerializer, railsRootWrappingTransformer, railsRootWrappingInterceptor, RailsResourceInjector, RailsInflector) {

                function RailsResource(value) {
                    var instance = this;
                    this.$snapshots = [];

                    if (value) {
                        var immediatePromise = function (data) {
                            return {
                                resource: RailsResource,
                                context: instance,
                                response: data,
                                then: function (callback) {
                                    this.response = callback(this.response, this.resource, this.context);
                                    return immediatePromise(this.response);
                                }
                            };
                        };

                        var data = this.constructor.callInterceptors(immediatePromise({data: value}), this).response.data;
                        angular.extend(this, data);
                    }
                }

                /**
                 * Extends the RailsResource to the child constructor function making the child constructor a subclass of
                 * RailsResource.  This is modeled off of CoffeeScript's class extend function.  All RailsResource
                 * class properties defined are copied to the child class and the child's prototype chain is configured
                 * to allow instances of the child class to have all of the instance methods of RailsResource.
                 *
                 * Like CoffeeScript, a __super__ property is set on the child class to the parent resource's prototype chain.
                 * This is done to allow subclasses to extend the functionality of instance methods and still
                 * call back to the original method using:
                 *
                 *     Class.__super__.method.apply(this, arguments);
                 *
                 * @param {function} child Child constructor function
                 * @returns {function} Child constructor function
                 */
                RailsResource.extendTo = function (child) {
                    angular.forEach(this, function (value, key) {
                        child[key] = value;
                    });

                    if (angular.isArray(this.$modules)) {
                        child.$modules = this.$modules.slice(0);
                    }

                    function ctor() {
                        this.constructor = child;
                    }

                    ctor.prototype = this.prototype;
                    child.prototype = new ctor();
                    child.__super__ = this.prototype;
                    return child;
                };

                /**
                 * Copies a mixin's properties to the resource.
                 *
                 * If module is a String then we it will be loaded using Angular's dependency injection.  If the name is
                 * not valid then Angular will throw an error.
                 *
                 * @param {...String|function|Object} mixins The mixin or name of the mixin to add.
                 * @returns {RailsResource} this
                 */
                RailsResource.extend = function () {
                    angular.forEach(arguments, function (mixin) {
                        addMixin(this, this, mixin, function (Resource, mixin) {
                            if (angular.isFunction(mixin.extended)) {
                                mixin.extended(Resource);
                            }
                        });
                    }, this);

                    return this;
                };

                /**
                 * Copies a mixin's properties to the resource's prototype chain.
                 *
                 * If module is a String then we it will be loaded using Angular's dependency injection.  If the name is
                 * not valid then Angular will throw an error.
                 *
                 * @param {...String|function|Object} mixins The mixin or name of the mixin to add
                 * @returns {RailsResource} this
                 */
                RailsResource.include = function () {
                    angular.forEach(arguments, function (mixin) {
                        addMixin(this, this.prototype, mixin, function (Resource, mixin) {
                            if (angular.isFunction(mixin.included)) {
                                mixin.included(Resource);
                            }
                        });
                    }, this);

                    return this;
                };

                /**
                 * Sets configuration options.  This method may be called multiple times to set additional options or to
                 * override previous values (such as the case with inherited resources).
                 * @param cfg
                 */
                RailsResource.configure = function (cfg) {
                    cfg = cfg || {};

                    if (this.config) {
                        cfg = angular.extend({}, this.config, cfg);
                    }

                    this.config = {};
                    this.config.url = cfg.url;
                    this.config.rootWrapping = booleanParam(cfg.rootWrapping, defaultOptions.rootWrapping); // using undefined check because config.rootWrapping || true would be true when config.rootWrapping === false
                    this.config.httpConfig = cfg.httpConfig || defaultOptions.httpConfig;
                    this.config.httpConfig.headers = angular.extend({'Accept': 'application/json', 'Content-Type': 'application/json'}, this.config.httpConfig.headers || {});
                    this.config.defaultParams = cfg.defaultParams || defaultOptions.defaultParams;
                    this.config.underscoreParams = booleanParam(cfg.underscoreParams, defaultOptions.underscoreParams);
                    this.config.updateMethod = (cfg.updateMethod || defaultOptions.updateMethod).toLowerCase();

                    this.config.requestTransformers = cfg.requestTransformers ? cfg.requestTransformers.slice(0) : [];
                    this.config.responseInterceptors = cfg.responseInterceptors ? cfg.responseInterceptors.slice(0) : [];
                    this.config.afterResponseInterceptors = cfg.afterResponseInterceptors ? cfg.afterResponseInterceptors.slice(0) : [];

                    this.config.serializer = RailsResourceInjector.getService(cfg.serializer || railsSerializer());

                    this.config.name = this.config.serializer.underscore(cfg.name);

                    // we don't want to turn undefined name into "undefineds" then the plural name won't update when the name is set
                    if (this.config.name) {
                        this.config.pluralName = this.config.serializer.underscore(cfg.pluralName || this.config.serializer.pluralize(this.config.name));
                    }

                    this.config.urlBuilder = railsUrlBuilder(this.config.url);
                    this.config.resourceConstructor = this;

                    this.extend.apply(this, loadExtensions((cfg.extensions || []).concat(defaultOptions.extensions)));

                    angular.forEach(this.$mixins, function (mixin) {
                        if (angular.isFunction(mixin.configure)) {
                            mixin.configure(this.config, cfg);
                        }
                    }, this);
                };

                /**
                 * Configures the URL for the resource.
                 * @param {String|function} url The url string or function.
                 */
                RailsResource.setUrl = function (url) {
                    this.configure({url: url});
                };

                RailsResource.buildUrl = function (context) {
                    return this.config.urlBuilder(context);
                };

                /**
                 * Add a callback to run on response and construction.
                 * @param fn(response data, constructor, context) - response data is either the resource instance returned or an array of resource instances,
                 *      constructor is the resource class calling the function,
                 *      context is the resource instance of the calling method (create, update, delete) or undefined if the method was a class method (get, query)
                 */
                RailsResource.beforeResponse = function (fn) {
                    fn = RailsResourceInjector.getDependency(fn);
                    this.config.responseInterceptors.push(function (promise) {
                        return promise.then(function (response) {
                            fn(response.data, promise.resource.config.resourceConstructor, promise.context);
                            return response;
                        });
                    });
                };

                /**
                 * Add a callback to run after response has been processed.  These callbacks are not called on object construction.
                 * @param fn(response data, constructor) - response data is either the resource instance returned or an array of resource instances and constructor is the resource class calling the function
                 */
                RailsResource.afterResponse = function (fn) {
                    fn = RailsResourceInjector.getDependency(fn);
                    this.config.afterResponseInterceptors.push(function (promise) {
                        return promise.then(function (response) {
                            fn(response, promise.resource.config.resourceConstructor);
                            return response;
                        });
                    });
                };

                /**
                 * Adds a function to run after serializing the data to send to the server, but before root-wrapping it.
                 * @param fn (data, constructor) - data object is the serialized resource instance, and constructor the resource class calling the function
                 */
                RailsResource.beforeRequest = function (fn) {
                    fn = RailsResourceInjector.getDependency(fn);
                    this.config.requestTransformers.push(function (data, resource) {
                        return fn(data, resource.config.resourceConstructor) || data;
                    });
                };

                // transform data for request:
                RailsResource.transformData = function (data) {
                    var config = this.config;
                    data = config.serializer.serialize(data);

                    forEachDependency(this.config.requestTransformers, function (transformer) {
                        data = transformer(data, config.resourceConstructor);
                    });

                    if (config.rootWrapping) {
                        data = railsRootWrappingTransformer(data, config.resourceConstructor);
                    }

                    return data;
                };

                // transform data on response:
                RailsResource.callInterceptors = function (promise, context) {
                    var config = this.config;

                    promise = promise.then(function (response) {
                        // store off the data in case something (like our root unwrapping) assigns data as a new object
                        response.originalData = response.data;
                        return response;
                    });

                    if (config.rootWrapping) {
                        promise.resource = config.resourceConstructor;
                        promise = railsRootWrappingInterceptor(promise);
                    }

                    promise.then(function (response) {
                        response.data = config.serializer.deserialize(response.data, config.resourceConstructor);
                        return response;
                    });

                    // data is now deserialized. call response interceptors including beforeResponse
                    forEachDependency(config.responseInterceptors, function (interceptor) {
                        promise.resource = config.resourceConstructor;
                        promise.context = context;
                        promise = interceptor(promise);
                    });

                    return promise;
                };

                // transform data after response has been converted to a resource instance:
                RailsResource.callAfterInterceptors = function (promise) {
                    var config = this.config;
                    // data is now deserialized. call response interceptors including afterResponse
                    forEachDependency(config.afterResponseInterceptors, function (interceptor) {
                        promise.resource = config.resourceConstructor;
                        promise = interceptor(promise);
                    });

                    return promise;
                };

                RailsResource.processResponse = function (promise) {
                    promise = this.callInterceptors(promise).then(function (response) {
                        return response.data;
                    });

                    return this.callAfterInterceptors(promise);
                };

                /**
                 * Processes query parameters before request.  You can override to modify
                 * the query params or return a new object.
                 *
                 * @param {Object} queryParams - The query parameters for the request
                 * @returns {Object} The query parameters for the request
                 */
                RailsResource.processParameters = function (queryParams) {
                    var newParams = {};

                    if (angular.isObject(queryParams) && this.config.underscoreParams) {
                        angular.forEach(queryParams, function (v, k) {
                            newParams[this.config.serializer.underscore(k)] = v;
                        }, this);

                        return newParams;
                    }

                    return queryParams;
                };

                RailsResource.getParameters = function (queryParams) {
                    var params;

                    if (this.config.defaultParams) {
                        // we need to clone it so we don't modify it when we add the additional
                        // query params below
                        params = angular.copy(this.config.defaultParams);
                    }

                    if (angular.isObject(queryParams)) {
                        params = angular.extend(params || {}, queryParams);
                    }

                    return this.processParameters(params);
                };

                RailsResource.getHttpConfig = function (queryParams) {
                    var params = this.getParameters(queryParams);

                    if (params) {
                        return angular.extend({params: params}, this.config.httpConfig);
                    }

                    return angular.copy(this.config.httpConfig);
                };

                /**
                 * Returns a URL from the given parameters.  You can override this method on your resource definitions to provide
                 * custom logic for building your URLs or you can utilize the parameterized url strings to substitute values in the
                 * URL string.
                 *
                 * The parameters in the URL string follow the normal Angular binding expression using {{ and }} for the start/end symbols.
                 *
                 * If the context is a number and the URL string does not contain an id parameter then the number is appended
                 * to the URL string.
                 *
                 * If the context is a number and the URL string does
                 * @param context
                 * @param path {string} (optional) An additional path to append to the URL
                 * @return {string}
                 */
                RailsResource.$url = RailsResource.resourceUrl = function (context, path) {
                    if (!angular.isObject(context)) {
                        context = {id: context};
                    }

                    return appendPath(this.buildUrl(context || {}), path);
                };

                RailsResource.$get = function (url, queryParams) {
                    return this.processResponse($http.get(url, this.getHttpConfig(queryParams)));
                };

                RailsResource.query = function (queryParams, context) {
                    return this.$get(this.resourceUrl(context), queryParams);
                };

                RailsResource.get = function (context, queryParams) {
                    return this.$get(this.resourceUrl(context), queryParams);
                };

                /**
                 * Returns the URL for this resource.
                 *
                 * @param path {string} (optional) An additional path to append to the URL
                 * @returns {string} The URL for the resource
                 */
                RailsResource.prototype.$url = function (path) {
                    return appendPath(this.constructor.resourceUrl(this), path);
                };

                RailsResource.prototype.processResponse = function (promise) {
                    promise = this.constructor.callInterceptors(promise, this);

                    promise = promise.then(angular.bind(this, function (response) {
                        // we may not have response data
                        if (response.hasOwnProperty('data') && angular.isObject(response.data)) {
                            angular.extend(this, response.data);
                        }

                        return this;
                    }));

                    return this.constructor.callAfterInterceptors(promise);
                };

                angular.forEach(['post', 'put', 'patch'], function (method) {
                    RailsResource['$' + method] = function (url, data) {
                        var config;
                        // clone so we can manipulate w/o modifying the actual instance
                        data = this.transformData(angular.copy(data));
                        config = angular.extend({method: method, url: url, data: data}, this.getHttpConfig());
                        return this.processResponse($http(config));
                    };

                    RailsResource.prototype['$' + method] = function (url) {
                        var data, config;
                        // clone so we can manipulate w/o modifying the actual instance
                        data = this.constructor.transformData(angular.copy(this, {}));
                        config = angular.extend({method: method, url: url, data: data}, this.constructor.getHttpConfig());
                        return this.processResponse($http(config));

                    };
                });

                RailsResource.prototype.create = function () {
                    return this.$post(this.$url(), this);
                };

                RailsResource.prototype.update = function () {
                    return this['$' + this.constructor.config.updateMethod](this.$url(), this);
                };

                RailsResource.prototype.isNew = function () {
                    return angular.isUndefined(this.id) ||
                        this.id === null;
                };

                RailsResource.prototype.save = function () {
                    if (this.isNew()) {
                        return this.create();
                    } else {
                        return this.update();
                    }
                };

                RailsResource.$delete = function (url) {
                    return this.processResponse($http['delete'](url, this.getHttpConfig()));
                };

                RailsResource.prototype.$delete = function (url) {
                    return this.processResponse($http['delete'](url, this.constructor.getHttpConfig()));
                };

                //using ['delete'] instead of .delete for IE7/8 compatibility
                RailsResource.prototype.remove = RailsResource.prototype['delete'] = function () {
                    return this.$delete(this.$url());
                };

                return RailsResource;

                function appendPath(url, path) {
                    if (path) {
                        if (path[0] !== '/') {
                            url += '/';
                        }

                        url += path;
                    }

                    return url;
                }

                function forEachDependency(list, callback) {
                    var dependency;

                    for (var i = 0, len = list.length; i < len; i++) {
                        dependency = list[i];

                        if (angular.isString(dependency)) {
                            dependency = list[i] = RailsResourceInjector.getDependency(dependency);
                        }

                        callback(dependency);
                    }
                }

                function addMixin(Resource, destination, mixin, callback) {
                    var excludedKeys = ['included', 'extended,', 'configure'];

                    if (!Resource.$mixins) {
                        Resource.$mixins = [];
                    }

                    if (angular.isString(mixin)) {
                        mixin = RailsResourceInjector.getDependency(mixin);
                    }

                    if (mixin && Resource.$mixins.indexOf(mixin) === -1) {
                        angular.forEach(mixin, function (value, key) {
                            if (excludedKeys.indexOf(key) === -1) {
                                destination[key] = value;
                            }
                        });

                        Resource.$mixins.push(mixin);

                        if (angular.isFunction(callback)) {
                            callback(Resource, mixin);
                        }
                    }
                }

                function loadExtensions(extensions) {
                    var modules = [];

                    angular.forEach(extensions, function (extensionName) {
                        extensionName = 'RailsResource' + extensionName.charAt(0).toUpperCase() + extensionName.slice(1) + 'Mixin';

                        modules.push(RailsResourceInjector.getDependency(extensionName));
                    });

                    return modules;
                }

                function booleanParam(value, defaultValue) {
                    return angular.isUndefined(value) ? defaultValue : value;
                }
            }];
    });

    angular.module('rails').factory('railsResourceFactory', ['RailsResource', function (RailsResource) {
        return function (config) {
            function Resource() {
                Resource.__super__.constructor.apply(this, arguments);
            }

            RailsResource.extendTo(Resource);
            Resource.configure(config);

            return Resource;
        };
    }]);

}());