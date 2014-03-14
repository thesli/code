function f = noiseadd(u, sigma)
    ns = randn(size(u));
    ns = ns - mean(ns(:));
    sig = sqrt(sum(ns(:).^2)/length(ns(:)));
    f = u + sigma/sig * ns;
return;