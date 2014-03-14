function f = reduceGrayLevel(u,level)
    f = level*rgb2gray(u/level);
end