package com.demo.rbac.service;

import com.demo.rbac.dto.GuideDTO;
import com.demo.rbac.model.Guide;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.demo.rbac.repository.GuideRepository;

import java.util.Optional;

@Service
public class GuideService {

    @Autowired
    private GuideRepository guideRepository;

    public Long getGuideIdByEmail(String email) {
        return guideRepository.findGuideIdByEmail(email).orElse(null);
    }
    

    public GuideDTO getGuideById(Long guideId) {
        // Assuming you already have a repository (e.g., GuideRepository) that you can use
        Optional<Guide> optGuide = guideRepository.findById(guideId);
        if (optGuide.isPresent()) {
            Guide guide = optGuide.get();
            return new GuideDTO(guide.getId(), guide.getName(), guide.getEmail());
        }
        return null;
    }

}
