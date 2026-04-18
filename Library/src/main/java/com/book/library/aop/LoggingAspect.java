package com.book.library.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
@Slf4j
public class LoggingAspect {
    @Pointcut("execution(* com.book.library.service..*(..))")
    public void serviceLayer() {

    }

    @Before("serviceLayer()")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Method Called: {}", joinPoint.getSignature().getName());
        log.info("Arguments: {}", joinPoint.getArgs());
    }

    @After("serviceLayer()")
    public void logAfter(JoinPoint joinPoint) {
        log.info("Method Finished: {}", joinPoint.getSignature().getName());
    }

    @Around("serviceLayer()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        long end = System.currentTimeMillis();
        Object result = joinPoint.proceed();

        log.info("Execution time of {} : {} ms", joinPoint.getSignature().getName(), (end - start));

        return result;
    }
}
