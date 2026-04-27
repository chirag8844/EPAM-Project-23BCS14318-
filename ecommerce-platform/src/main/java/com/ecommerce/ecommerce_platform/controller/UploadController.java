package com.ecommerce.ecommerce_platform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.ecommerce.ecommerce_platform.service.FileStorageService;

import java.util.Map;

@RestController
@RequestMapping("/upload")
public class UploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file);
        return Map.of("url", url);
    }
}
