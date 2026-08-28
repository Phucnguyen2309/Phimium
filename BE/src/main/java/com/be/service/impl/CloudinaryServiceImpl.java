package com.be.service.impl;

import com.be.exception.AppException;
import com.be.exception.ErrorCode;
import com.be.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImage (MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of("folder", "product-app/products",
                            "resource_type", "image")
            );
            return uploadResult.get("secure_url").toString();
        }catch (Exception e){
            throw new AppException(
                    ErrorCode.CLOUDINARY_ERROR
            );
        }
    }
}
