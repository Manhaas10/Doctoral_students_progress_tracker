package com.demo.rbac.service.publications;

import com.demo.rbac.dto.PublicationhRequest;
import com.demo.rbac.model.Publicationhistory;
import com.demo.rbac.repository.PublicationhRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublicationhistoryService {

    private final PublicationhRepository publicationhRepository;

    public PublicationhistoryService(PublicationhRepository publicationhRepository) {
        this.publicationhRepository = publicationhRepository;
    }

    // ✅ Get the latest history entry for a given title and roll number
    public Optional<Publicationhistory> getLatestHistoryByTitleAndRollNo(String title, String rollNo) {
        return publicationhRepository.findTopByTitleAndRollNoOrderByIdDesc(title, rollNo);
    }

    // ✅ Save a new publication history entry if it differs from the latest entry
    public Publicationhistory savePublicationHistory(PublicationhRequest request) {
        Optional<Publicationhistory> latestEntryOpt = getLatestHistoryByTitleAndRollNo(request.getTitle(), request.getRollNo());

        if (latestEntryOpt.isPresent()) {
            Publicationhistory latestEntry = latestEntryOpt.get();

            // ✅ Avoid duplicate history if `status` and `dateOfSubmission` are the same
            if (latestEntry.getStatus().equals(request.getStatus()) &&
                latestEntry.getDateOfSubmission().equals(request.getDateOfSubmission())) {
                return null; // No need to insert a duplicate log
            }
        }

        // ✅ Save a new entry if there's a change
        Publicationhistory history = new Publicationhistory();
        history.setTitle(request.getTitle());
        history.setPublishername(request.getPublishername());
        history.setJournal(request.getJournal());
        history.setDoi(request.getDoi());
        history.setPublicationType(request.getPublicationType());
        history.setQuartile(request.getQuartile());
        history.setStatus(request.getStatus());
        history.setRollNo(request.getRollNo());
        history.setDateOfSubmission(request.getDateOfSubmission());

        return publicationhRepository.save(history);
    }

    // ✅ Save without checking for duplicates (useful when explicitly needed)
    public Publicationhistory saveNewPublicationHistory(Publicationhistory history) {
        return publicationhRepository.save(history);
    }

    // ✅ Get publication history by ID
    public Optional<Publicationhistory> getPublicationHistoryById(Long id) {
        return publicationhRepository.findById(id);
    }
    public List<Publicationhistory> getHistoryByRollNo(String rollNo) {
        return publicationhRepository.findByRollNo(rollNo);
    }
}
