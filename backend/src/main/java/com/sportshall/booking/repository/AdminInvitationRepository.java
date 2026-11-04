
package com.sportshall.booking.repository;

import com.sportshall.booking.entity.AdminInvitation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AdminInvitationRepository
        extends JpaRepository<AdminInvitation, Long> {

    Optional<AdminInvitation> findByTokenHash(String tokenHash);

    boolean existsByEmailAndUsedFalse(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM AdminInvitation i WHERE i.tokenHash = :tokenHash")
    Optional<AdminInvitation> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash);
}
