function [] = var2img(u,filename)
    imwrite(uint8(u),filename);
end