module.exports = (grunt)->
  grunt.initConfig
    watch: "something"
  grunt.loadNpmTasks "grunt-contrib-watch"
  grunt.registerTask "default",["watch"]