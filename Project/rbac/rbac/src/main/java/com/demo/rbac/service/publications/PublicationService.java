package com.demo.rbac.service.publications;

import com.demo.rbac.dto.PublicationRequest;
import com.demo.rbac.model.Publication;
import com.demo.rbac.repository.PublicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;

    public PublicationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }
    

    // ✅ Save or update a publication
    public Publication savePublication(Publication publication) {
        return publicationRepository.save(publication);
    }

    // ✅ Get all publications
    public List<Publication> getAllPublications() {
        return publicationRepository.findAll();
    }

    // ✅ Get a publication by ID
    public Optional<Publication> getPublicationById(Long id) {
        return publicationRepository.findById(id);
    }

    // ✅ Find publications using a single roll number
    public List<Publication> getPublicationsByRollNo(String rollNo) {
        return publicationRepository.findByRollNo(rollNo);  // Assuming your repository has this method
    }

    // ✅ Update only the status of a publication
    public Optional<Publication> updatePublicationStatus(Long id, String newStatus) {
        Optional<Publication> publicationOpt = publicationRepository.findById(id);

        if (publicationOpt.isPresent()) {
            Publication publication = publicationOpt.get();
            publication.setStatus(newStatus);  // ✅ Update only status
            return Optional.of(publicationRepository.save(publication));
        }
        return Optional.empty();
    }

    // ✅ Save a publication from a request (PublicationRequest)
    public Publication savePublication(PublicationRequest request) {
        Publication publication = new Publication();
        publication.setTitle(request.getTitle());
        publication.setPublishername(request.getPublishername());
        publication.setJournal(request.getJournal());
        publication.setDoi(request.getDoi());
        publication.setPublicationType(request.getPublicationType());
        publication.setQuartile(request.getQuartile());
        publication.setStatus(request.getStatus());
        publication.setIndexing(request.getIndexing());
    //    / publication.setSendCopyToCoordinator(request.isSendCopyToCoordinator());
        publication.setRollNo(request.getRollNo());
        publication.setDateOfSubmission(request.getDateOfSubmission()); // ✅ Set dateOfSubmission
    
        return publicationRepository.save(publication);
    }
    
}
