package com.ecommerce.ecommerce_platform.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import com.ecommerce.ecommerce_platform.service.FileStorageService;
import java.util.ArrayList;

import com.ecommerce.ecommerce_platform.entity.Product;
import com.ecommerce.ecommerce_platform.service.ProductService;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product addProduct(
            @RequestPart("product") Product product,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        String role = (String) request.getAttribute("authUserRole");
        if (authId == null || role == null || !"VENDOR".equals(role)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Only vendors can add products");
        }
        if (files != null && files.length > 0) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    imageUrls.add(fileStorageService.storeFile(file));
                }
            }
            if (product.getImages() == null)
                product.setImages(new ArrayList<>());
            product.getImages().addAll(imageUrls);
        }

        com.ecommerce.ecommerce_platform.entity.User vendor = new com.ecommerce.ecommerce_platform.entity.User();
        vendor.setId(authId);
        product.setVendor(vendor);

        return productService.addProduct(product);
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Product> getProductsByVendor(@PathVariable Long vendorId) {
        return productService.getProductsByVendor(vendorId);
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String q) {
        return productService.searchProducts(q);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Product updateProduct(
            @PathVariable Long id,
            @RequestPart("product") Product product,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        String role = (String) request.getAttribute("authUserRole");
        if (authId == null || role == null || !"VENDOR".equals(role)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Only vendors can update products");
        }
        // verify ownership
        Product existing = productService.getProductById(id);
        if (existing.getVendor() == null || !authId.equals(existing.getVendor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to modify this product");
        }
        if (files != null && files.length > 0) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    imageUrls.add(fileStorageService.storeFile(file));
                }
            }
            if (product.getImages() == null)
                product.setImages(new ArrayList<>());
            product.getImages().addAll(imageUrls);
        }

        return productService.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        Long authId = (Long) request.getAttribute("authUserId");
        String role = (String) request.getAttribute("authUserRole");
        if (authId == null || role == null || !"VENDOR".equals(role)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Only vendors can delete products");
        }
        Product existing = productService.getProductById(id);
        if (existing.getVendor() == null || !authId.equals(existing.getVendor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this product");
        }
        productService.deleteById(id);
    }
}
