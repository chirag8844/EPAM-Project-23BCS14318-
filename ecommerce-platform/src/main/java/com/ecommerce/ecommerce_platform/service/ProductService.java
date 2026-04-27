package com.ecommerce.ecommerce_platform.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ecommerce.ecommerce_platform.entity.Product;
import com.ecommerce.ecommerce_platform.entity.User;
import com.ecommerce.ecommerce_platform.exception.NoProductFoundException;
import com.ecommerce.ecommerce_platform.repository.ProductRepository;
import com.ecommerce.ecommerce_platform.repository.UserRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Product addProduct(Product product) {

        Long vendorId = product.getVendor().getId();

        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        product.setVendor(vendor);

        // validate discount if provided
        if (product.getDiscountPercentage() != null) {
            double d = product.getDiscountPercentage();
            if (d < 0 || d > 100) {
                throw new IllegalArgumentException("discountPercentage must be between 0 and 100");
            }
        }

        // ensure backward compatibility with existing DB schema where the
        // discount_percentage column may be NOT NULL — default to 0 when
        // client omits the field.
        if (product.getDiscountPercentage() == null) {
            product.setDiscountPercentage(0.0);
        }

        return productRepository.save(product);
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        // Return an empty list when a vendor has no products instead of throwing.
        return productRepository.findByVendorId(vendorId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoProductFoundException("Product with ID " + id + " not found"));
    }

    // public List<Product> searchProducts(String q) {
    // return productRepository.searchProducts(q);
    // }

    public List<Product> searchProducts(String q) {
        List<Product> all = productRepository.findAll();

        return all.stream()
                .sorted((a, b) -> similarity(b.getName(), q) - similarity(a.getName(), q))
                .toList();
    }

    private int similarity(String a, String b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        return a.contains(b) ? 100 : 0;
    }

    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }

    public Product updateProduct(Long id, Product updated) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new NoProductFoundException("Product with ID " + id + " not found"));

        if (updated.getName() != null)
            existing.setName(updated.getName());
        if (updated.getDescription() != null)
            existing.setDescription(updated.getDescription());
        if (updated.getPrice() != 0)
            existing.setPrice(updated.getPrice());
        if (updated.getQuantity() != 0)
            existing.setQuantity(updated.getQuantity());
        if (updated.getCategory() != null)
            existing.setCategory(updated.getCategory());
        if (updated.getBrand() != null)
            existing.setBrand(updated.getBrand());
        if (updated.getDiscountPercentage() != null) {
            double d = updated.getDiscountPercentage();
            if (d < 0 || d > 100) {
                throw new IllegalArgumentException("discountPercentage must be between 0 and 100");
            }
            existing.setDiscountPercentage(updated.getDiscountPercentage());
        }
        existing.setRating(updated.getRating());
        existing.setTotalReviews(updated.getTotalReviews());
        if (updated.getDeliveryInfo() != null)
            existing.setDeliveryInfo(updated.getDeliveryInfo());
        if (updated.getSellerInfo() != null)
            existing.setSellerInfo(updated.getSellerInfo());
        if (updated.getImages() != null)
            existing.setImages(updated.getImages());
        if (updated.getAvailableSizes() != null)
            existing.setAvailableSizes(updated.getAvailableSizes());
        if (updated.getAvailableColors() != null)
            existing.setAvailableColors(updated.getAvailableColors());
        if (updated.getHighlights() != null)
            existing.setHighlights(updated.getHighlights());

        if (updated.getVendor() != null && updated.getVendor().getId() != null) {
            userRepository.findById(updated.getVendor().getId()).ifPresent(existing::setVendor);
        }

        return productRepository.save(existing);
    }
}