package com.siscoca.repository;

import com.siscoca.model.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {
    
    List<MensajeChat> findByCampanaIdOrderByFechaCreacionAsc(Long campanaId);
    
    List<MensajeChat> findByCampanaIdOrderByFechaCreacionDesc(Long campanaId);
    
    @Query("SELECT COUNT(m) FROM MensajeChat m WHERE m.campana.id = :campanaId AND m.leido = false")
    Long countMensajesNoLeidosPorCampana(Long campanaId);
    
    List<MensajeChat> findByLeidoFalse();
    
    List<MensajeChat> findByRemitenteAndLeidoFalse(String remitente);
    
    @Query("SELECT COUNT(DISTINCT m.campana.id) FROM MensajeChat m WHERE m.leido = false AND m.remitente != :username")
    Long countCampañasConMensajesSinLeer(String username);
    
    @Query("SELECT COUNT(m) FROM MensajeChat m WHERE m.leido = false")
    Long countMensajesNoLeidos();
}

