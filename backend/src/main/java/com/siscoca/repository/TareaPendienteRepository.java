package com.siscoca.repository;

import com.siscoca.model.TareaPendiente;
import com.siscoca.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TareaPendienteRepository extends JpaRepository<TareaPendiente, Long> {
    
    List<TareaPendiente> findByCompletadaFalse();
    
    List<TareaPendiente> findByCompletadaFalseAndResponsableRol(Rol rol);
    
    List<TareaPendiente> findByCompletadaFalseAndAsignadoA(String asignadoA);
    
    @Query("SELECT t FROM TareaPendiente t WHERE t.completada = false AND (t.responsableRol = :rol OR t.asignadoA = :username)")
    List<TareaPendiente> findTareasPendientesParaUsuario(Rol rol, String username);
    
    List<TareaPendiente> findByCampanaId(Long campanaId);
    
    List<TareaPendiente> findByCampanaIdAndCompletadaFalse(Long campanaId);
    
    List<TareaPendiente> findByCampanaIdAndCompletadaTrue(Long campanaId);
    
    Optional<TareaPendiente> findByCampanaIdAndTipoTareaAndCompletadaFalse(Long campanaId, com.siscoca.model.TipoTarea tipoTarea);
}





